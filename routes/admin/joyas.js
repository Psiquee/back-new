var express = require('express');
const pool = require('../../models/bd');
var router = express.Router();
var joyasModel = require('../../models/joyasModel');
var util = require('util');
var cloudinary = require('cloudinary').v2;
var uploader = util.promisify(cloudinary.uploader.upload);
var destroy = util.promisify(cloudinary.uploader.destroy);


/* para alistar novedades */
router.get('/', async function (req, res, next) {

  var joyas = await joyasModel.getJoyas();

  joyas = joyas.map(joya => {
    if (joya.img_id) {
      const imagen = cloudinary.image(joya.img_id, {
        width: 100,
        height: 100,
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

  res.render('admin/joyas', {  //joyas.hbs
    layout: 'admin/layout',  //layout.hbs
    usuario: req.session.nombre,
    joyas
  });
}); //cierre inicial

//diseno de agregar
router.get('/agregar', (req, res, next) => {
  res.render('admin/agregar', {
    layout: 'admin/layout'
  }) //cierra render
})// cierra get

/*insertar joya*/
router.post('/agregar', async (req, res, next) => {
  try {
    var img_id = '';
    console.log(req.files.imagen);
    if (req.files && Object.keys(req.files).length > 0) {
      imagen = req.files.imagen;
      img_id = (await uploader(imagen.tempFilePath)).public_id;
    }

    if (req.body.titulo != "" && req.body.descripcion != "" && req.body.precio != "") {
      await joyasModel.insertJoya({
        ...req.body, //spread >titu descrip, precio
        img_id
      });

      res.redirect('/admin/joyas')
    } else {
      res.render('admin/agregar', {
        layout: 'admin/layout',
        error: true,
        message: 'Todos los campos son requeridos'
      })
    }
  } catch (error) {
    console.log(error)
    res.render('admin/agregar', {
      layout: 'admin/layout',
      error: true,
      message: 'No se cargo la joya'
    })
  }
})

/*Eliminar */ //:id para que el numero sea aleatorio. params captura el dato
router.get('/eliminar/:id', async (req, res, next) => {
  var id = req.params.id;

  let joya = await joyasModel.getJoyaById(id);
  if (joya.img_id) {
    await (destroy(joya.img_id));
  }

  await joyasModel.deleteJoyasById(id);
  res.redirect('/admin/joyas');
});
//cierra get de eliminar

/*modificar la vista > formulario y los datos cargados */
router.get('/modificar/:id', async (req, res, next) => {
  var id = req.params.id;
  //console.log(req.params.id);
  var joya = await joyasModel.getJoyaById(id);


  res.render('admin/modificar', {
    layout: 'admin/layout',
    joya
  })
});

/*Actualizar */
router.post('/modificar', async (req, res, next) => {
  try {
    let img_id = req.body.img_original;

    let borrar_img_vieja = false;

    if (req.body.img_delete === "1") {
      img_id = null;
      borrar_img_vieja = true;
    } else {
      if (req.files && Object.keys(req.files).length > 0) {
        imagen = req.files.imagen;
        img_id = (await uploader(imagen.tempFilePath)).public_id;
        borrar_img_vieja = true;
      }
    }
    if (borrar_img_vieja && req.body.img_original) {
      await (destroy(req.body.img_original));
    }


    var obj = {
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      img_id,
      precio: req.body.precio
     
    }

    //console.log(req.body.id)
    await joyasModel.modificarJoyaById(obj, req.body.id);

    res.redirect('/admin/joyas');
  }
  catch (error) {
    console.log(error)
    res.render('admin/modificar', {
      layout: 'admin/layout',
      error: true,
      message: 'No se modifico la joya'
    })
  }
})

/*getJoyaByTipoJoyaId */
router.get('/joyas/:id/', async (req, res, next) => {
  const tipoJoyaId = req.params.id;

  const joyas = await joyasModel.getJoyaByTipoJoyaId(id);
  
   res.render ('elHtmlDestino', {
    joyas
   })

});


module.exports = router;
