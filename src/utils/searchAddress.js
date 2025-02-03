const axios = require('axios');
require('dotenv').config();

const searchAddress = async (address) => {
    try {
        const response = await axios.get('https://rsapi.goong.io/Place/AutoComplete', {
            params: {
                input: address,
                api_key: process.env.GOONG_API_KEY,
            },
        });
        const data = response.data;
        if (data.predictions && data.predictions.length > 0) {
            return data.predictions; // Trả về danh sách gợi ý địa chỉ
        }
        return [];
    } catch (error) {
        return [];
    }
};

module.exports = searchAddress;
