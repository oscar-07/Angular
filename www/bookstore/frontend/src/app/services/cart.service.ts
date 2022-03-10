import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartModelPublic, CartModelServer } from '../models/cart.model';
import { ProductModelServer } from '../models/product.models';
import { OrderService } from './order.service';
import { ProductService } from './product.service';
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";

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
          }else{
            this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? this.cartDataServer.data[index].numInCart++ : prod.quantity;
          }
          this.cartDataclient.prodData[index].incart = this.cartDataServer.data[index].numInCart;
        }else{
          //b. si el carrito no tiene cosas
          this.cartDataServer.data.push({
            numInCart: 1,
            product: prod
          });

          this.cartDataclient.prodData.push({
            incart: 1,
            id: prod.id
          });
          //Despliega las notificaciones


          //calcula el monto total
          this.cartDataclient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataclient));
          this.cartData$.next({...this.cartDataServer});
        }
      }
    });
  }
  UpdateCartItems(index: number, increase: boolean){
    let data = this.cartDataServer.data[index];
    if(increase){
      data.numInCart < data.product.quantity ? data.numInCart++ : data.product.quantity;
      this.cartDataclient.prodData[index].incart = data.numInCart;
      //genera el calculo total
      this.cartDataclient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataclient));
      this.cartData$.next({...this.cartDataServer});
    }else{
      data.numInCart--;
      if(data.numInCart < 1){
        //borra el producto del carrito
        this.cartData$.next({...this.cartDataServer});
      }else{
        this.cartData$.next({...this.cartDataServer});
        this.cartDataclient.prodData[index].incart = data.numInCart;
        this.cartDataclient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataclient));
      }
    }
  }
  DeleteProductFromCart(index: number){
    if(window.confirm('Quieres retirar este articulo')){
      this.cartDataServer.data.splice(index,1);
      this.cartDataclient.prodData.splice(index, 1);
      //calcula el monto total
      this.cartDataclient.total = this.cartDataServer.total;
      if(this.cartDataclient.total === 0){
        this.cartDataclient = {total: 0, prodData: [{  incart: 0, id: 0 }]  };
        localStorage.setItem('cart', JSON.stringify(this.cartDataclient));
      }else{
        localStorage.setItem('cart', JSON.stringify(this.cartDataclient));
      }
      if(this.cartDataServer.total === 0){
        this.cartDataServer = { total: 0, data: [{ numInCart: 0, product: undefined }]};
        this.cartData$.next({...this.cartDataServer});
      }else{
        this.cartData$.next({...this.cartDataServer});
      }


    }else{
      //si realiza la cancelacion
      return;
    }
  }
  CheckoutFromCart(userId: number){
    //this.http.post(`${this.serverURL}orders/payment`, null).subscribe((res: { success: Boolean }) => {
    this.http.post<{success: boolean}>(`${this.serverURL}/orders/payment`, null).subscribe((res) => {
      if (res.success) {

        this.resetServerData();
        //this.http.post(`${this.serverURL}orders/new`, {
        this.http.post<OrderResponse>(`${this.serverURL}/orders/new`, {
          userId: userId,
          products: this.cartDataclient.prodData
        //}).subscribe((data: OrderResponse) => {
        }).subscribe((data: OrderResponse) => {

          this.orderService.getSingleOrder(data.order_id).then(prods => {
            if (data.success) {
              const navigationExtras: NavigationExtras = {
                state: {
                  message: data.message,
                  products: prods,
                  orderId: data.order_id,
                  total: this.cartDataclient.total
                }
              };
              //this.spinner.hide().then();
              this.router.navigate(['/thankyou'], navigationExtras).then(p => {
                this.cartDataclient = {prodData: [{incart: 0, id: 0}], total: 0};
                this.cartTotal$.next(0);
                localStorage.setItem('cart', JSON.stringify(this.cartDataclient));
              });
            }
          });

        })
        //)
      } else {
        //this.spinner.hide().then();
        this.router.navigateByUrl('/checkout').then();
        //this.toast.error(`Sorry, failed to book the order`, "Order Status", {
        //  timeOut: 1500,
        //  progressBar: true,
        //  progressAnimation: 'increasing',
        //  positionClass: 'toast-top-right'
        //})
      }
    })
  }



  /*
  CheckoutFromCart(userId: number){
    //this.http.post(`${this.serverURL}/orders/payment`, null).subscribe((res: {success: boolean}) => {
    //this.http.post<any>(`${this.serverURL}/orders/payment`, null).subscribe((res: {success: boolean}) => {
    //https://stackoverflow.com/questions/67378540/why-do-i-have-errors-inside-my-subscribe 
    this.http.post<{success: boolean}>(`${this.serverURL}/orders/payment`, null).subscribe((res) => {
      if(res.success){
        this.resetServerData();
        //inicia aqui
        //this.http.post(`${this.serverURL}/orders/new`, {
          this.http.post<{data: OrderResponse}>(`${this.serverURL}/orders/new`, {
          userId: userId,
          products: this.cartDataclient.prodData
        //}).subscribe((data: OrderResponse) => {
          //termina 
          }).subscribe(this.orderService.getSingleOrder(data.order_id).then(prods => {
              if(data.success){
                const navigationExtras: NavigationExtras = {
                  state: {
                    message: data.message,
                    products: prods,
                    orderId: DataTransfer.order_id,
                    total: this.cartDataclient.total
                  }
                };
              // Genera una conexion
this.router.navigate(['/thankyou'], navigationExtras)
              }
            });
          );
          
            
      }
    });
  } 
  */

  private CalculateTotal(){
    let Total = 0;
    this.cartDataServer.data.forEach(p => {
      const {numInCart} = p;
      const {price} = p.product;
      Total += numInCart * price;
    });
    this.cartDataServer.total = Total;
    this.cartTotal$.next(this.cartDataServer.total);
  }
  private resetServerData() {
    this.cartDataServer = {
      total: 0,
      data: [{
        numInCart: 0,
        product: undefined
      }]
    };
    this.cartData$.next({...this.cartDataServer})
    }  
  

}

interface OrderResponse {
  order_id: number;
  success: boolean;
  message: string;
  products: [{
    id: string,
    numIncart: string
  }];
}