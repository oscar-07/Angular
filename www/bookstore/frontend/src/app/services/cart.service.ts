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

}