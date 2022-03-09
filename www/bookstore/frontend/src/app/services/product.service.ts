import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ProductModelServer, ServerResponse } from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  /* Esto se esconde en ENVIROMENT.TS SERVER_URL = "http://localhost:3000/api"; */
  private SERVER_URL = environment.SERVER_URL;
  constructor(private http: HttpClient) { }
  
  /*Aqui toma los productos del backend*/
  getAllProducts(numberOfResults = 10): Observable<ServerResponse>{
    return this.http.get<ServerResponse>(this.SERVER_URL + '/products',{ 
      params: {
        limit: numberOfResults.toString()
      }
    });
  }
  /*Toma un producto */
  getSingleProduct(id: number): Observable<ProductModelServer>{
    return this.http.get<ProductModelServer>(this.SERVER_URL + '/products' + id);
  }


  /* toma un producto de una categoria*/
  getproductsFromCategory(catName: string): Observable<ProductModelServer[]> {
    return this.http.get<ProductModelServer[]>(this.SERVER_URL + '/products/category/' + catName)
  }


}
