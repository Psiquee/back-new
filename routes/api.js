var express = require('express');
var router = express.Router();
var joyasModel = require('./../models/joyasModel');
var cloudinary = require('cloudinary').v2;
var nodemailer = require ('nodemailer');


router.get('/joyas', async function (req, res, next) {

 var joyas = await joyasModel.getJoyas();

    joyas = joyas.map(joya => {
        if (joya.img_id) {
            const imagen = cloudinary.url(joya.img_id, {
                width: 600 ,//modificar tamano de imagen diseno
                height: 400,
                crop: 'fill' //pad
             
            });
            return {
                ...joya,
                imagen
            }
        } else {
            return {
                ...joya,
                imagen: ''
            }
        }
    });

   res.json(joyas);

});

//finaliza joyas

router.post ('/contacto', async (req, res)=> {
    const mail ={
        to: 'cande.mathieu22@gmail.com',
        subject: 'Contacto web',
        html: `${req.body.nombre} ${req.body.apellido} se contacto a traves de la web y quiere mas informacion a este correo: ${req.body.email} <br>
        Ademas, hizo la siguiente consulta: ${req.body.mensaje}`
    }
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS

        }
      }); // cierra transp

      await transport.sendMail(mail)
      res.status(201).json ({
        error: false,
        message: 'Mensaje enviado'
      });

    });//cierra post api

module.exports = router;