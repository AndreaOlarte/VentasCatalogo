/**
 * @swagger
 * definitions:
 *   Producto:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       idUsuario:
 *         type: integer
 *       nombre:
 *         type: string
 *       descripcion:
 *         type: string
 *       precio:
 *         type: number
 *       imagen:
 *         type: string
 *         description: UUID de la imágen en formato 00000000-0000-0000-0000-000000000000
 */


const Pool = require('../../system/MysqlPool')
const UUID = require('uuid/v4')
const fs = require('fs')

// Declaración de la clase
module.exports = (function() {
    
    function Productos() { }
    
    Productos.prototype.agregar = (idUsuario, producto) => {
        return new Promise((resolve, reject) => { // El UUID de la imágen debe de modificarse luego

            const base64Data = producto.imagen.replace(/^data:image\/png;base64,/, "");
            const uuidImagen = UUID();
            fs.writeFile(`application/public/img/${uuidImagen}.jpg`, base64Data, 'base64', function(err) {
              console.log(err);
            });

            Pool.query("INSERT INTO productos VALUES (NULL, ?, ?, ?, ?, ?, DEFAULT, DEFAULT, NULL)", [
                idUsuario,
                producto.nombre,
                producto.descripcion,
                producto.precio,
                uuidImagen
            ]).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        })
    }
    
    Productos.prototype.obtenerPorId = (idUsuario, idProducto) => {
        return new Promise((resolve, reject) => {
            Pool.query("SELECT * FROM productos WHERE idUsuario = ? AND id = ? AND deletedAt IS NULL", [
                idUsuario,
                idProducto
            ]).then(result => {
                if (result.length > 0) {
                    resolve(result[0]);
                } else {
                    resolve(null);
                }
            }).catch(err => {
                reject(err);
            });
        })
    }
    
    Productos.prototype.obtenerPaginado = (idUsuario, page, perPage) => {
        const offset = (page - 1) * perPage;
        const limit = perPage;
        return new Promise((resolve, reject) => {
            Pool.query("SELECT * FROM productos WHERE idUsuario = ? AND deletedAt IS NULL LIMIT ? OFFSET ?", [
                idUsuario,
                limit,
                offset
            ]).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        })
    }

    Productos.prototype.obtenerTotal = (idUsuario) => {
        return new Promise((resolve, reject) => {
            Pool.query("SELECT COUNT(*) AS total FROM productos WHERE idUsuario = ? AND deletedAt IS NULL", [
                idUsuario,
            ]).then(result => {
                resolve(result[0].total);
            }).catch(err => {
                reject(err);
            });
        })
    }

    Productos.prototype.modificar = (idUsuario, idProducto, producto) => {
        return new Promise((resolve, reject) => {
            if (producto.imagen) {
                const base64Data = producto.imagen.replace(/^data:image\/png;base64,/, "");
                const uuidImagen = UUID();
                fs.writeFile(`application/public/img/${uuidImagen}.jpg`, base64Data, 'base64', function(err) {
                    console.log(err);
                });
    
                Pool.query("UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ? AND idUsuario = ?", [
                    producto.nombre,
                    producto.descripcion,
                    producto.precio,
                    uuidImagen,
                    idProducto,
                    idUsuario,
                ]).then(result => {
                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
            } else {
                Pool.query("UPDATE productos SET nombre = ?, descripcion = ?, precio = ? WHERE id = ? AND idUsuario = ?", [
                    producto.nombre,
                    producto.descripcion,
                    producto.precio,
                    idProducto,
                    idUsuario,
                ]).then(result => {
                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
            }
        })
    }

    Productos.prototype.eliminar = (idUsuario, idProducto) => {
        return new Promise((resolve, reject) => {
            Pool.query("UPDATE productos SET deletedAt = CURRENT_TIMESTAMP WHERE id = ? AND idUsuario = ?", [
                idProducto,
                idUsuario,
            ]).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        })
    }

    return Productos;
})();
