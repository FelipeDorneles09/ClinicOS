/**
 * Mock automático do Prisma Client usando jest-mock-extended.
 *
 * Cada teste importa esse mock e configura os retornos via
 * `prismaMock.modelo.metodo.mockResolvedValue(...)`.
 *
 * O jest.config.ts mapeia todas as importações de "../lib/prisma"
 * para este arquivo, evitando qualquer conexão real com o banco.
 */
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

const prismaMock = mockDeep<PrismaClient>();

// Reseta todos os mocks antes de cada teste para evitar vazamento de estado
beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock as unknown as PrismaClient;
export { prismaMock };
export type PrismaMock = DeepMockProxy<PrismaClient>;
