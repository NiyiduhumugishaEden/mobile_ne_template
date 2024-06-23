import { validateProduct } from '../validation/productValidator';
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prismaClient = new PrismaClient();

export default class ProductsController {
        /**
    * @swagger
    * /products:
    *  post:
    *    description: Create a new product
    *    parameters:
    *      - in: body
    *        name: product
    *        description: The product to create.
    *        schema:
    *          type: object
    *          required:
    *            - name
    *            - description
    *            - price
    *          properties:
    *            name:
    *              type: string
    *            description:
    *              type: string
    *            price:
    *              type: number
    *    responses:
    *      201:
    *        description: Product created successfully
    *      404:
    *        description: User not found
    *      500:
    *        description: Internal Server Error
    */
    public static async createProduct(req: Request, res: Response) {
        try {
            const product = validateProduct(req.body);
            const createdBy = await prismaClient.user.findUnique({
                where: {
                    // @ts-ignore
                    id: req.user
                }
            })
            if (!createdBy) {
                return res.status(404).json({
                    message: "User not found"
                })
            }

            const newProduct = await prismaClient.product.create({
                data: {
                    ...product,
                    createdBy: { connect: { id: createdBy.id } }
                }
            });

            res.status(201).json({
                success: true,
                product: newProduct
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }

/**
  * @swagger
  * /products:
  *  get:
  *    description: Get all products
  *    responses:
  *      200:
  *        description: List of products
  *      404:
  *        description: User not found
  *      500:
  *        description: Internal Server Error
  */
    public static async getProducts(req: Request, res: Response) {
        try {
            const createdBy = await prismaClient.user.findUnique({
                where: {
                    // @ts-ignore
                    id: req.user
                }
            })
            if (!createdBy) {
                return res.status(404).json({
                    message: "User not found"
                })
            }

            const products = await prismaClient.product.findMany({
                where: {
                    createdBy: {
                        id: createdBy.id
                    }
                }
            });
            res.status(200).json({
                success: true,
                products
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
    /**
    * @swagger
    * /products/{id}:
    *  put:
    *    description: Update a product
    *    parameters:
    *      - in: path
    *        name: id
    *        schema:
    *          type: string
    *        required: true
    *        description: ID of the product to update
    *      - in: body
    *        name: product
    *        description: The product data to update.
    *        schema:
    *          type: object
    *          required:
    *            - name
    *            - description
    *            - price
    *          properties:
    *            name:
    *              type: string
    *            description:
    *              type: string
    *            price:
    *              type: number
    *    responses:
    *      200:
    *        description: Product updated successfully
    *      403:
    *        description: Forbidden
    *      404:
    *        description: Product not found
    *      500:
    *        description: Internal Server Error
    */
    public static async updateProduct(req: Request, res: Response) {
        try {
            const productId = req.params.id;
            const product = validateProduct(req.body);

            const existingProduct = await prismaClient.product.findUnique({
                where: {
                    id: productId
                }
            });
            if (!existingProduct) {
                return res.status(404).json({
                    message: "Product not found"
                })
            }
            // @ts-ignore
            if (existingProduct.userId !== req.user) {
                return res.status(403).json({
                    message: "Forbidden"
                })
            }
            const updatedProduct = await prismaClient.product.update({
                where: {
                    id: productId,
                },
                data: product
            });

            res.status(200).json({
                success: true,
                updatedProduct
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }

        /**
  * @swagger
  * /products/{id}:
  *  delete:
  *    description: Delete a product
  *    parameters:
  *      - in: path
  *        name: id
  *        schema:
  *          type: string
  *        required: true
  *        description: ID of the product to delete
  *    responses:
  *      200:
  *        description: Product deleted successfully
  *      404:
  *        description: Product not found
  *      500:
  *        description: Internal Server Error
  */
    public static async deleteProduct(req: Request, res: Response) {
        try {
            const productId = req.params.id;

            const createdBy = await prismaClient.user.findUnique({
                where: {
                    // @ts-ignore
                    id: req.user
                }
            })
            if (!createdBy) {
                return res.status(404).json({
                    message: "User not found"
                })
            }
            const product = await prismaClient.product.delete({
                where: {
                    id: productId,
                    userId: createdBy.id
                }
            });
            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                })
            }
            res.status(200).json({
                success: true,
                product
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
}