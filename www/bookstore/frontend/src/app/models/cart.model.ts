import { ProductModelServer } from "./product.models";

export interface CartModelServer {
    total: number;
    data: [{
      product: ProductModelServer,
      numInCart: number
    }];
  }
  
  export interface CartModelPublic {
    total: number;
    prodData: [{
      id: number,
      incart: number
    }];
  }