const { createData } = require('./src/services/data.services')
const bodyParser = require('body-parser')
const { PrismaClient } = require('@prisma/client');

let express = require("express");
let app = express();
let port = 3000;

const prisma = new PrismaClient();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static("./static"));
app.post('/add-data', async (req,res) => {
        const { nama, warna, bentuk, kristal} = req.body;

        
       const data = await prisma.data.create({
            data: {
                nama,
                warna,
                bentuk,
                kristal,
            },
            })
  
        return res.status(200).json({
            data,
            message:"Berhasil"
        })
})

// app.set("port",3000)
app.listen(port, function() {
    console.log(`Listening at http://localhost:${port}`);
});
