import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseFloatPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Productos } from './products.interface';
import { ProductsDto } from './dto/products.dto/products.dto';
interface datos { "id": string, "size": string };

interface entrada { articulo: string, precio: number };

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    //Conectando con el servicio
    @Get()
    getAllProducts(): Productos[] {
        return this.productsService.getAllProducts();
    }
    @Get(':id')
    getProduct(@Param('id') id: number) {
        return this.productsService.getId(id);
    }
    @Get('total')
    getTotal() {
        return this.productsService.total();
    }
    @Post()
    createProduct(@Body()nuevo: ProductsDto): string {
        return this.productsService.insert(nuevo);
    }

    @Delete(':id')
    borrarId(@Param('id') id: number) {
        return this.productsService.delete(id);
    }

    @Put(':id')
    actualiazaProducto(@Param('id') id: number,
        @Body() body) {
        return this.productsService.update(id, body);
    }

}
