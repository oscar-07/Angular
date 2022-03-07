import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  /* Esto se esconde en ENVIROMENT.TS SERVER_URL = "http://localhost:3000/api"; */
  private SERVER_URL = environment.SERVER_URL;
  constructor(private http: HttpClient) { }
  
  /*Aqui toma los productos del backend*/
  getAllProducts(numberOfResults = 10){
    return this.http.get(this.SERVER_URL + '/products',{ 
      params: {
        limit: numberOfResults.toString()
      }
    });
  }

}
