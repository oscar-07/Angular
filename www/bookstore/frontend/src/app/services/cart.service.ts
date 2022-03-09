import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartModelPublic, CartModelServer } from '../models/cart.model';
import { ProductModelServer } from '../models/product.models';
import { OrderService } from './order.service';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private serverURL = environment.SERVER_URL;

  //almacena la informacion de los productos localmente
  private cartDataclient: CartModelPublic = {
    total: 0,
    prodData: [{
      incart: 0,
      id: 0
    }]
  };

  //almacena la informacion de los productos en el server
  private cartDataServer: CartModelServer = {
    total: 0,
    data: [{
      numInCart: 0,
      product: undefined
    }]
  };

  /*metodos observables*/
  cartTotal$ = new BehaviorSubject<number>(0);
  cartData$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);



  constructor(private http: HttpClient,
              private productService: ProductService,
              private orderService: OrderService,
              private router: Router
              ) { 
      this.cartTotal$.next(this.cartDataServer.total);
      this.cartData$.next(this.cartDataServer);
      
      //let info: CartModelPublic = JSON.parse(localStorage.getItem('cart'));
      let info: CartModelPublic = JSON.parse(localStorage.getItem('cart')|| '{}');
               
               if(info !== null && info !== undefined && info.prodData[0].incart !== 0){
                 //memoria local no es vacia
                 this.cartDataclient =info;
                 // se genera un loop en el cartDataServer
                 this.cartDataclient.prodData.forEach(p => {
                  this.productService.getSingleProduct(p.id).subscribe((actualProductInfo: ProductModelServer)=>{
                    if(this.cartDataServer.data[0].numInCart === 0){
                      this.cartDataServer.data[0].numInCart = p.incart;
                      this.cartDataServer.data[0].product = actualProductInfo;
                      //realiza el calculo
                      this.cartDataclient.total = this.cartDataServer.total;
                      localStorage.setItem('cart',JSON.stringify(this.cartDataclient));
                    }else{
                      //si ya esta registrado lo ingresa
                      this.cartDataServer.data.push({
                        numInCart: p.incart,
                        product: actualProductInfo
                      });
                      this.cartDataclient.total = this.cartDataServer.total;
                      localStorage.setItem('cart',JSON.stringify(this.cartDataclient));
                    }
                    this.cartData$.next({...this.cartDataServer});
                  });
                 });

               }
  }


  AddProductToCart(id: number, quantity?: number){
    this.productService.getSingleProduct(id).subscribe(prod => {
      //si el carrito esta vacio
      if (this.cartDataServer.data[0].product === undefined){
        this.cartDataServer.data[0].product = prod;
        this.cartDataServer.data[0].numInCart = quantity !== undefined ? quantity : 1;
        //aqui calcula el monto
        this.cartDataclient.prodData[0].incart = this.cartDataServer.data[0].numInCart;
        this.cartDataclient.prodData[0].id = prod.id;
        this.cartDataclient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataServer));
        this.cartData$.next({...this.cartDataServer});
      }else{
        //si el carrito tiene cosas
        let index = this.cartDataServer.data.findIndex(p => p.product.id ===prod.id ); //-1 o toma un valor positivo
        //a. si esta listo el carritox
        if(index !== -1){
          if(quantity !== undefined && quantity <= prod.quantity){
            this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? quantity : prod.quantity;
          }
        }

      }
    })




      //b. si el carrito no tiene cosas
  }

}