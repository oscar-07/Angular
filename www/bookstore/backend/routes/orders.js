const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');

/*Ordenes*/

router.get('/', (req, res) => {
    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'u.username'])
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.json(orders);
            } else {
                res.json({message: "No orders found"});
            }

        }).catch(err => res.json(err));
});

/* Una orden */
router.get('/:id', (req, res) => {
    let orderId = req.params.id;
    console.log(orderId);

    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'p.image', 'od.quantity as quantityOrdered'])
        .filter({'o.id': orderId})
        .getAll()
        .then(orders => {
            console.log(orders);
            if (orders.length > 0) {
                res.json(orders);
            } else {
                res.json({message: "No orders found"});
            }

        }).catch(err => res.json(err));
});

/* nueva orden */
router.post('/new', (req, res) => {

    let {userId, products} = req.body;
    
    if(userId !== null && userId > 0 && !isNaN(userId)){
        database.table('orders')
        .insert({user_id: userId
        }).then(newOrderId => {
            if(newOrderId > 0){
                products.forEach(async (p)=> {
                    let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();
                    let inCart = p.incart;
                    /*se tiene que validar alguna descripcion */
                    if(data.quantity > 0){
                        data.quantity = data.quantity - inCart;
                        if(data.quantity < 0 ){
                            data.quantity = 0;
                    
                        }   
                    }else{
                        data.quantity = 0;
                    }
                    /* agregar los detalles y generar un nuevo id */
                    database.table('orders_details')
                        .insert({
                            order_id: newOrderId,
                            product_id: p.id,
                            quantity: inCart
                        }).then(newId => {
                            database.table('products')
                                .filter({id: p.id})
                                .update({
                                    quantity: data.quantity
                                }).then(successNum =>{}).catch(err => console.log(err));
                        }).catch(err => console.log(err));
                });
             }else{
                res.json({message: 'sucedio un error en la nueva orden, ver detalles ',success: false})
             }
             res.json({
                 message: `Orden generada correctamente su id es ${newOrderId}`,
                 success: true,
                 order_id: newOrderId,
                 products: products
             });
        }).catch(err => console.log(err));
    }
    else{
        res.json({message: 'Fallo al generar una nueva orden',success: false})
    }

});


/*Pago falso */
router.post('/payment',(req,res) =>{
    setTimeout( ()=>{
        res.status(200).json({success: true});
    },3000)
});



module.exports = router;