import { PrismaClient, Role, StatusConsulta } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // ─── Limpeza (ordem respeitando FK constraints) ───────────────────────────
  await prisma.consulta.deleteMany();
  await prisma.medicoEspecialidade.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.especialidade.deleteMany();
  await prisma.usuario.deleteMany();

  // ─── Especialidades ──────────────────────────────────────────────────────
  console.log("📋 Criando especialidades...");
  const [cardiologia, pediatria, ortopedia, neurologia, dermatologia] =
    await Promise.all([
      prisma.especialidade.create({ data: { nome: "Cardiologia", descricao: "Diagnóstico e tratamento de doenças cardiovasculares" } }),
      prisma.especialidade.create({ data: { nome: "Pediatria", descricao: "Cuidados médicos para crianças e adolescentes" } }),
      prisma.especialidade.create({ data: { nome: "Ortopedia", descricao: "Tratamento do sistema musculoesquelético" } }),
      prisma.especialidade.create({ data: { nome: "Neurologia", descricao: "Diagnóstico de doenças do sistema nervoso" } }),
      prisma.especialidade.create({ data: { nome: "Dermatologia", descricao: "Cuidados com pele, cabelo e unhas" } }),
    ]);

  // ─── Usuários Admin e Recepcionistas ─────────────────────────────────────
  console.log("👤 Criando usuários...");
  const senhaAdmin = await bcrypt.hash("admin123", 12);
  const senhaRecep = await bcrypt.hash("recep123", 12);

  const admin = await prisma.usuario.create({
    data: {
      nome: "Rodrigo Cavalcante",
      email: "admin@clinicos.com",
      senhaHash: senhaAdmin,
      role: Role.ADMIN,
    },
  });

  const [recep1, recep2] = await Promise.all([
    prisma.usuario.create({
      data: {
        nome: "Marina Teixeira",
        email: "marina.recep@clinicos.com",
        senhaHash: senhaRecep,
        role: Role.RECEPCIONISTA,
      },
    }),
    prisma.usuario.create({
      data: {
        nome: "Letícia Drummond",
        email: "leticia.recep@clinicos.com",
        senhaHash: senhaRecep,
        role: Role.RECEPCIONISTA,
      },
    }),
  ]);

  // ─── Médicos (cria usuario + medico numa transação) ──────────────────────
  console.log("🩺 Criando médicos...");
  const senhaMedico = await bcrypt.hash("medico123", 12);

  const medico1 = await prisma.medico.create({
    data: {
      crm: "CRM-SP 84.312",
      usuario: {
        create: {
          nome: "Dr. Augusto Ferreira Neto",
          email: "augusto.ferreira@clinicos.com",
          senhaHash: senhaMedico,
          role: Role.MEDICO,
        },
      },
      especialidades: {
        create: [
          { especialidadeId: cardiologia.id },
          { especialidadeId: neurologia.id },
        ],
      },
    },
  });

  const medico2 = await prisma.medico.create({
    data: {
      crm: "CRM-SP 61.087",
      usuario: {
        create: {
          nome: "Dra. Camila Resende",
          email: "camila.resende@clinicos.com",
          senhaHash: senhaMedico,
          role: Role.MEDICO,
        },
      },
      especialidades: {
        create: [{ especialidadeId: pediatria.id }],
      },
    },
  });

  const medico3 = await prisma.medico.create({
    data: {
      crm: "CRM-RJ 29.441",
      usuario: {
        create: {
          nome: "Dr. Rafael Monteiro",
          email: "rafael.monteiro@clinicos.com",
          senhaHash: senhaMedico,
          role: Role.MEDICO,
        },
      },
      especialidades: {
        create: [
          { especialidadeId: ortopedia.id },
          { especialidadeId: dermatologia.id },
        ],
      },
    },
  });

  // ─── Pacientes ───────────────────────────────────────────────────────────
  console.log("🏥 Criando pacientes...");
  const [pac1, pac2, pac3, pac4, pac5] = await Promise.all([
    prisma.paciente.create({
      data: {
        nomeCompleto: "Beatriz Almeida Sousa",
        cpf: "34812764093",
        dataNasc: new Date("1987-03-14"),
        telefone: "+55 (11) 98347-2019",
        email: "beatriz.sousa@email.com",
      },
    }),
    prisma.paciente.create({
      data: {
        nomeCompleto: "Carlos Eduardo Pimentel",
        cpf: "72931058416",
        dataNasc: new Date("1952-08-27"),
        telefone: "+55 (11) 94712-8063",
        observacoes: "Hipertenso. Acompanhamento trimestral.",
      },
    }),
    prisma.paciente.create({
      data: {
        nomeCompleto: "Isabela Rocha Viana",
        cpf: "58203917645",
        dataNasc: new Date("2019-01-05"),
        telefone: "+55 (21) 99201-4387",
        email: "isabela.mae@email.com",
        observacoes: "Criança. Acompanhamento pediátrico.",
      },
    }),
    prisma.paciente.create({
      data: {
        nomeCompleto: "Fernando Lopes Garibaldi",
        cpf: "91047362580",
        dataNasc: new Date("1975-11-19"),
        telefone: "+55 (11) 93658-7142",
      },
    }),
    prisma.paciente.create({
      data: {
        nomeCompleto: "Priscila Nascimento Barbosa",
        cpf: "46739201857",
        dataNasc: new Date("1993-06-30"),
        telefone: "+55 (31) 98473-6029",
        email: "priscila.nb@email.com",
      },
    }),
  ]);

  // ─── Consultas (hoje e passadas) ─────────────────────────────────────────
  console.log("📅 Criando consultas...");

  const hoje = new Date();
  const hj = (h: number, m = 0) => {
    const d = new Date(hoje);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const diasAtras = (n: number, h: number, m = 0) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - n);
    d.setHours(h, m, 0, 0);
    return d;
  };

  await Promise.all([
    // Hoje - agenda ativa do Dr. Augusto
    prisma.consulta.create({
      data: {
        pacienteId: pac2.id,
        medicoId: medico1.id,
        dataHora: hj(8, 0),
        status: StatusConsulta.CONCLUIDA,
        observacoes: "Paciente estável. Manter medicação atual.",
        criadoPorId: recep1.id,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pac1.id,
        medicoId: medico1.id,
        dataHora: hj(9, 0),
        status: StatusConsulta.EM_ANDAMENTO,
        criadoPorId: recep1.id,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pac4.id,
        medicoId: medico1.id,
        dataHora: hj(10, 0),
        status: StatusConsulta.AGENDADA,
        criadoPorId: recep2.id,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pac5.id,
        medicoId: medico1.id,
        dataHora: hj(11, 0),
        status: StatusConsulta.AGENDADA,
        criadoPorId: recep1.id,
      },
    }),

    // Hoje - Dra. Camila (Pediatria)
    prisma.consulta.create({
      data: {
        pacienteId: pac3.id,
        medicoId: medico2.id,
        dataHora: hj(8, 30),
        status: StatusConsulta.CONCLUIDA,
        observacoes: "Rotina pediátrica. Crescimento adequado.",
        criadoPorId: recep1.id,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pac1.id,
        medicoId: medico2.id,
        dataHora: hj(10, 0),
        status: StatusConsulta.AGENDADA,
        criadoPorId: recep2.id,
      },
    }),

    // Hoje - Dr. Rafael (Ortopedia)
    prisma.consulta.create({
      data: {
        pacienteId: pac4.id,
        medicoId: medico3.id,
        dataHora: hj(9, 30),
        status: StatusConsulta.AGENDADA,
        criadoPorId: recep1.id,
      },
    }),

    // Históricas (passado)
    prisma.consulta.create({
      data: {
        pacienteId: pac2.id,
        medicoId: medico1.id,
        dataHora: diasAtras(7, 9, 0),
        status: StatusConsulta.CONCLUIDA,
        observacoes: "Retorno cardiológico. Eletrocardiograma normal.",
        criadoPorId: recep1.id,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pac5.id,
        medicoId: medico3.id,
        dataHora: diasAtras(14, 14, 0),
        status: StatusConsulta.CANCELADA,
        observacoes: "Cancelado pelo paciente.",
        criadoPorId: recep2.id,
      },
    }),
    prisma.consulta.create({
      data: {
        pacienteId: pac3.id,
        medicoId: medico2.id,
        dataHora: diasAtras(30, 10, 30),
        status: StatusConsulta.CONCLUIDA,
        observacoes: "Vacinação em dia. Próximo retorno em 6 meses.",
        criadoPorId: recep1.id,
      },
    }),
  ]);

  console.log("\n✅ Seed concluído com sucesso!\n");
  console.log("─── Credenciais de acesso ──────────────────────");
  console.log(`🔑 Admin          | admin@clinicos.com         | admin123`);
  console.log(`🔑 Recepcionista  | marina.recep@clinicos.com  | recep123`);
  console.log(`🔑 Recepcionista  | leticia.recep@clinicos.com | recep123`);
  console.log(`🔑 Médico         | augusto.ferreira@clinicos.com | medico123`);
  console.log(`🔑 Médico         | camila.resende@clinicos.com   | medico123`);
  console.log(`🔑 Médico         | rafael.monteiro@clinicos.com  | medico123`);
  console.log("────────────────────────────────────────────────\n");

  // Suppress unused variable warnings
  void recep2;
  void admin;
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
