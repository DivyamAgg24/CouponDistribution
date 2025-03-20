import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma: ReturnType<typeof prismaClientSingleton> = globalThis.prismaGlobal ?? prismaClientSingleton()

const db = prisma

export {db}

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma