const mercadopago = require("mercadopago");
const Product = require("../models/auth.modelMenu");
const transaccion = require("../models/auth.modelTransacciones");
const fecha = new Date().toLocaleDateString();
const mongoose = require("mongoose");
exports.getData = async (req, res) => {
  // let dataProductos = [];
  // for(let i = 0; i<req.body.productos.length; i++) {
  //   const products = await Product.findOne({_id:req.body.productos[i].id})
  //   dataProductos.push({
  //     id:products._id,
  //     title: products.nombre,
  //     quantity: req.body.productos[i].cantidad,
  //     unit_price: parseInt(products.precio),
  //   })
  // }
  let itemsProducts = [
    {
      title: "Productos",
      quantity: 1,
      unit_price: req.body.total_pago,
    },
  ];
  console.log(fecha);
  const client = new mercadopago.MercadoPagoConfig({
    accessToken:
      "TEST-1175297249318297-030816-e2ab1189bd638ddccd10514d28dab4cb-1719437028",
  });

  const preference = new mercadopago.Preference(client);
  let url = "";

  preference
    .create({
      body: {
        items: itemsProducts,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1,
        },
        notification_url:
        "https://af5a-189-240-192-130.ngrok-free.app/data-pago",
      },
    })
    .then((data) => {
      url = data.init_point;
      return res.json({
        url_pago: url,
      });
    })
    .catch(console.log);
};

exports.saveCompra = async (req, res) => {
  console.log(await req.body.data);
  const client = new mercadopago.MercadoPagoConfig({
    accessToken:
      "TEST-1175297249318297-030816-e2ab1189bd638ddccd10514d28dab4cb-1719437028",
  });
  if (req.body.data !== undefined) {
    const data = new mercadopago.Payment(client).capture(req.body.data);

     console.log((await data).api_response.status);
     if ((await data).api_response.status === 200) {
       const transaccionNew = new transaccion({
         _id: new mongoose.Types.ObjectId(),
         tipoTransaccion: "entrada",
         monto: (await data).transaction_amount,
         fechaDeTransaccion: fecha,
       });
       console.log(transaccionNew);
       transaccionNew.save();
     }
     return res.json({
       message: "Compra realizada",
     });
  }
};
