const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.export = {
    createData : async ({
        nama,
        warna,
        bentuk,
        kristal
      }) => {
            return prisma.data.create({
            data: {
                nama,
                warna,
                bentuk,
                kristal,
            },
            })
        }
}
