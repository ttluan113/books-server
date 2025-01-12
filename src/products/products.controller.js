const modelProducts = require('./products.model');

class controllerProducts {
    async addProduct(req, res, next) {
        try {
            const file = req.files;

            const { name, price, description, quantity, company, publicationDate, type, size, page, publishingHouse } =
                req.body;

            if (
                !file ||
                !name ||
                !price ||
                !description ||
                !quantity ||
                !company ||
                !publicationDate ||
                !type ||
                !size ||
                !page ||
                !publishingHouse
            ) {
                return res.status(400).json({ message: 'Bạn đang thiếu thông tin !!!' });
            }

            const images = file.map((item) => {
                return item.filename;
            });

            const newProduct = new modelProducts({
                images,
                name,
                price,
                description,
                quantity,
                options: {
                    company,
                    publicationDate,
                    type,
                    size,
                    page,
                    publishingHouse,
                },
                countBuy: 0,
            });
            await newProduct.save();
            return res.status(201).json({ message: 'Thêm sản phẩm thành công !!!' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async getProducts(req, res, next) {
        try {
            const products = await modelProducts.find();
            return res.status(200).json(products);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server error !!!' });
        }
    }

    async getProduct(req, res, next) {
        try {
            const { id } = req.query;
            const product = await modelProducts.findById(id);
            const brandProducts = await modelProducts.find({ 'options.company': product?.options?.company });
            const data = {
                product,
                brandProducts,
            };
            return res.status(200).json(data);
        } catch (error) {
            console.log(error);

            return res.status(500).json({ message: 'Server error !!!' });
        }
    }
}

module.exports = new controllerProducts();
