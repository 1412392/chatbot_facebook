

//import { read } from 'fs';

var fetch = require('node-fetch');
var request = require("request")

var elasticsearch = require('elasticsearch');
var soap = require('soap');

// var FB_PAGE_TOKEN = 'EAAdDXpuJZCS8BAHrQmdaKGOUC51GPjtXwZBXlX6ZCN4OuGNssuky7ffyNwciAmicecV7IfX0rOfsFNUwZCMnZATJxWpkK0aFmj2XUuhacR8XA1sWsFiGasBtBcAOgon0BQqeP8RDCm6VQR9V9Ygxow0EvBwbhrHjwViGHDQ77dIkfkY3XDhzv';

// var FB_APP_SECRET = '2ee14b4e3ccc367b37fce196af51ae09';
// var severRasaQuery = "http://localhost:5000/parse?q=";


//that
var FB_PAGE_TOKEN = 'EAACRBClCBPgBAP7IYZCrDz5CqXDoiKwK5IJvGMjdJTaHY61zus2TpEEJq3ZAv5B6fZCkwYzfTgBZBQZAiVe12Gvbl0PfAlttZBthWH768oSsNpNkGON7GV1PzAX3bweuIVUtW09iZB83nmZAYZA29PjdHvzYRKMFkOSMGTQw2YQdlWgZDZD';

var FB_APP_SECRET = '75c838f0d45258179eb1a8078b4e61f9';
var severRasaQuery = 'http://10.1.4.77:5000/parse?q=';


var urlApiProduct = "http://api.thegioididong.com/ProductSvc.svc?singleWsdl";
var urlApiCategory = "http://api.thegioididong.com/CategorySvc.svc?singleWsdl";
var urlwcfProduct = "http://webservice.thegioididong.com/ProductSvc.asmx?wsdl";
var provinceDefault = 3;
var pagesizedefault = 10;
var pageIndexDefault = 0;

var el = new elasticsearch.Client({
    host: '192.168.2.54:9200',
    log: 'trace'
});



const sessions = {};

const findOrCreateSession = (fbid) => {
    let sessionId;
    // Let's see if we already have a session for the user fbid
    Object.keys(sessions).forEach(k => {
        if (sessions[k].fbid === fbid) {
            // Yep, got it!
            sessionId = k;
        }
    });
    if (!sessionId) {
        // No session found for user fbid, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = {
            fbid: fbid,
            context: {}
        };
    }
    return sessionId;
};


const fbMessagebutton = (id, text) => {

    //console.log(text);

    const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
    return fetch('https://graph.facebook.com/v2.10/me/messages?' + qs, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: text,
    })
        .then(rsp => rsp.json())
        .then(json => {
            if (json.error && json.error.message) {
                throw new Error(json.error.message);
            }

            return json;
        });


};


const fbMessage = (id, text, questionTitle, state, intent) => {
    //console.log('send=' + text);

    var body = "";

    if (state === 0)//câu hỏi do user send, không phải từ postback
    {
        if (intent == "greet") {
            body = JSON.stringify({
                recipient: {
                    id
                },
                message: {

                    attachment: {
                        type: "template",

                        payload: {
                            template_type: "generic",
                            elements: [
                                {
                                    title: questionTitle,
                                    subtitle: text,
                                    buttons: [
                                        {
                                            type: "web_url",
                                            url: "https://www.thegioididong.com",
                                            title: "Xem trên website"
                                        }, {
                                            type: "postback",
                                            title: "Hỏi sản phẩm",
                                            payload: "1"
                                        },
                                        {
                                            type: "postback",
                                            title: "Hỏi giá",
                                            payload: "2"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                },
            });

        }
        else {
            body = JSON.stringify({
                recipient: {
                    id
                },
                message: {
                    text
                },
            });
        }

    }
    else {
        body = JSON.stringify({
            recipient: {
                id
            },
            message: {
                text
            },
        });
    }

    //console.log(body);

    const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
    return fetch('https://graph.facebook.com/v2.10/me/messages?' + qs, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body,
    })
        .then(rsp => rsp.json())
        .then(json => {
            if (json.error && json.error.message) {
                throw new Error(json.error.message);
            }

            return json;
        });


};


const fbEvaluate = (id) => {
    //console.log('send=' + text);

    var body = JSON.stringify({
        recipient: {
            id
        },
        message: {

            attachment: {
                type: "template",

                payload: {
                    template_type: "generic",
                    elements: [
                        {
                            title: "Phiếu đánh giá dịch vụ",
                            buttons: [
                                {
                                    type: "postback",
                                    title: "Tốt",
                                    payload: "GOOD"
                                }, {
                                    type: "postback",
                                    title: "Trung bình",
                                    payload: "NORMAL"
                                },
                                {
                                    type: "postback",
                                    title: "Tệ",
                                    payload: "BAD"
                                }
                            ]
                        }
                    ]
                }
            }
        },
    });



    //console.log(body);

    const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
    return fetch('https://graph.facebook.com/v2.10/me/messages?' + qs, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body,
    })
        .then(rsp => rsp.json())
        .then(json => {
            if (json.error && json.error.message) {
                throw new Error(json.error.message);
            }

            return json;
        });


};

function change_alias(alias) {
    var str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    str = str.replace(/ + /g, " ");
    str = str.trim();
    return str;
}


function APIGetProductColor(url, args, fn) {
    soap.createClient(url, function (err, client) {

        client.GetProductColorByProductIDLang(args, function (err, result) {

            var productColor = JSON.parse(JSON.stringify(result));

            // console.log("=============================");
            // console.log(productDetail);

            //resultanswer=ChangeResultAnswer(productDetail);

            fn(productColor);
            // self.resultanswer+="Sản phẩm: "+productDetail.GetProductDetailBySiteIDResult.ProductName+"\n"+
            // "Giá: "+productDetail.GetProductDetailBySiteIDResult.ExpectedPrice;


        });

    });
}

function APIGetSeoURLProduct(url, args, fn) {
    soap.createClient(url, function (err, client) {

        client.getSeoURLProduct(args, function (err, result) {

            var seourl = JSON.parse(JSON.stringify(result));

            var final = "https://thegioididong.com" + seourl.getSeoURLProductResult;
            fn(final);



        });

    });
}



function APIGetProductDetail(url, args, fn) {
    soap.createClient(url, function (err, client) {

        client.GetProduct(args, function (err, result) {

            var productDetail = JSON.parse(JSON.stringify(result));

            // console.log("=============================");
            // console.log(productDetail);

            //resultanswer=ChangeResultAnswer(productDetail);

            fn(productDetail);
            // self.resultanswer+="Sản phẩm: "+productDetail.GetProductDetailBySiteIDResult.ProductName+"\n"+
            // "Giá: "+productDetail.GetProductDetailBySiteIDResult.ExpectedPrice;


        });

    });
}

function APICheckInStock(url, args, fn) {
    soap.createClient(url, function (err, client) {

        client.GetStoreInStock2016(args, function (err, result) {

            var stores = JSON.parse(JSON.stringify(result));
            fn(stores);


        });

    });
}

function APIGetDistrictByProvince(url, args, fn) {
    soap.createClient(url, function (err, client) {

        client.GetDistricByProvince(args, function (err, result) {

            var lstDistric = JSON.parse(JSON.stringify(result));
            fn(lstDistric);

        });

    });
}


function APIGetProductSearch(url, args, fn) {
    soap.createClient(url, function (err, client) {

        client.SearchProductPhi(args, function (err, result) {

            var productSearch = JSON.parse(JSON.stringify(result));
            fn(productSearch);

        });

    });
}

function hasNumber(myString) {
    return /\d/.test(myString);
}

async function getElasticSearch(client, index, type, keyword, callback) {

    await client.search({
        index: index,
        type: type,
        q: keyword
    }, function (error, response) {
        if (error) return callback(error, null); // returns the callback with the error that happened

        return callback(null, response.hits.hits);
    });  // returns the result of showdocs(response)

}

async function getElasticSearchDistrictAndProvince(client, index, type, keyword, provinveID, callback) {

    await client.search({
        index: index,
        type: type,
        q: keyword + " AND " + "provinceID:" + '"' + provinveID + '"'
    }, function (error, response) {
        if (error) return callback(error, null); // returns the callback with the error that happened

        return callback(null, response.hits.hits);
    });  // returns the result of showdocs(response)

}



const getJsonAndAnalyze = (url, sender, sessionId, button_payload_state) => {
    //console.log(url);
    return request({
        url: url,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        json: true
    }, function (error, response, body) {
        console.log(JSON.stringify(body)); // Print the json response
        // if (!error && response.statusCode === 200) {
        //     console.log(body) // Print the json response
        // }
        var object = JSON.stringify(body);
        var json = JSON.parse(object);

        var resultanswer = "";

        //   console.log(json.intent);
        //   console.log(json.entities);

        // console.log(json.text);

        var intent = json.intent.name;
        var entities = json.entities;
        var questionTitle = "";

        var a = "";

        //xác định entities
        if (entities == null || entities.length == 0) {
            // sessions[sessionId].product=null;


            //chỉ resset lại color (vì color sẽ khác với sp khác)
            if (hasNumber(sessions[sessionId].color))//nó là productcode
            {
                console.log("==============MÃ MÀU PRODUCTCODE " + sessions[sessionId].color + " =================================");
                sessions[sessionId].color = null;
            }
            // sessions[sessionId].price=null;
            // sessions[sessionId].province=null;
            // sessions[sessionId].district=null;

            if (button_payload_state != 1 && button_payload_state != 2 && button_payload_state != 3 &&
                button_payload_state.toString().length < 10 && hasNumber(button_payload_state))//là districtID
            {
                sessions[sessionId].district = button_payload_state;
            }
            else if (button_payload_state.length >= 10)//la productCode color
            {
                sessions[sessionId].color = button_payload_state;
            }
            else if (button_payload_state === "NORMAL" || button_payload_state === "BAD" || button_payload_state === "GOOD") {
                fbMessage(sender, "Cảm ơn bạn đã đánh giá. Rất vui được giúp đỡ bạn.", questionTitle, button_payload_state, "")
                    .catch(console.error);
                return;
            }



        }
        else {

            if (hasNumber(sessions[sessionId].color))//nó là productcode
            {
                //console.log(hasNumber(sessions[sessionId].color));
                sessions[sessionId].color = null;
            }

            for (var i = 0; i < entities.length; i++) {

                sessions[sessionId].currentvalue = entities[i].value;
                if (entities[i].entity === "product") {
                    sessions[sessionId].product = entities[i].value;
                }
                if (entities[i].entity === "color") {
                    sessions[sessionId].color = entities[i].value;
                }
                if (entities[i].entity === "price") {
                    sessions[sessionId].price = entities[i].value;
                }
                if (entities[i].entity === "province") {

                    //nếu có tỉnh mới, reset lại huyện

                    if (sessions[sessionId].province)
                        sessions[sessionId].district = null;

                    sessions[sessionId].province = entities[i].value;

                }
                if (entities[i].entity === "district") {
                    sessions[sessionId].district = entities[i].value;

                }

            }
        }



        if ((intent === null || intent === "") && ((!sessions[sessionId].product) && (!sessions[sessionId].province) && (!sessions[sessionId].district))) {
            //nếu đã có trong session

            questionTitle = "Xin chào!";
            resultanswer = "Mình là BOT. Mình chưa rõ câu hỏi của bạn lắm. Vui lòng chọn thông tin cần quan tâm!";


        }
        else {

            //truong hợp này intent có thể null
            if (intent === null || intent === "") {
                if (sessions[sessionId].prev_intent)//nếu trước đó đã hỏi
                {
                    intent = sessions[sessionId].prev_intent;
                }
            }


            if (intent === "greet") {
                sessions[sessionId].prev_intent = "greet";
                questionTitle = "Xin chào!";
                resultanswer = "Hi. Mình có thể giúp gì cho bạn?Vui lòng sử dụng tiếng việt có dấu nha bạn.";

            }
            else if (intent === "goodbye") {
                sessions[sessionId].prev_intent = "goodbye";
                questionTitle = "Cảm ơn!";
                resultanswer = "Cảm ơn bạn. Chúc bạn một ngày vui vẻ nha! Hihi\n";
                resultanswer += "Bạn có thể đánh giá giúp mình được không? Thank bạn nhiều nha hihi\n";

                fbEvaluate(sender);


            }
            else if (intent === "thankyou") {
                sessions[sessionId].prev_intent = "thankyou";
                questionTitle = "Cảm ơn!";
                resultanswer = "Cảm ơn bạn. Rất hân hạnh được phục vụ bạn. Chúc bạn một ngày tốt đẹp";
            }

            else if (intent === "ask_stock" || intent === "ask_price" || intent === "ask_old_stock") {
                if (intent === "ask_stock")
                    sessions[sessionId].prev_intent = "ask_stock";
                if (intent === "ask_price")
                    sessions[sessionId].prev_intent = "ask_price";
                if (intent === "ask_old_stock")
                    sessions[sessionId].prev_intent = "ask_old_stock";


                questionTitle = "Thông tin sản phẩm!";
                //ten san pham, gia ca, dia chi, mau sac

                if (sessions[sessionId].product) {

                    var productName = sessions[sessionId].product;
                    console.log(productName);




                    //nếu có tỉnh,tp => lấy tên tỉnh,tp
                    var province;
                    var district;
                    var color;
                    if (sessions[sessionId].province) {

                        province = sessions[sessionId].province;



                    }
                    //nếu có quận.huyện =>lấy nó
                    if (sessions[sessionId].district) {


                        district = sessions[sessionId].district;


                    }

                    if (sessions[sessionId].color) {
                        color = sessions[sessionId].color;

                    }


                    var keyword = productName;

                    // var intRowCountRef=0;
                    // var categoryLstRef=[];
                    // var productTypeLstRef=[];
                    // var categoryDefault=0;
                    var argsSearchProduct = "";

                    //console.log(keyword.toLowerCase());

                    if (keyword.toLowerCase().includes("ốp lưng") ||
                        keyword.toLowerCase().includes("op lung") ||
                        keyword.toLowerCase().includes("tai nghe") ||
                        keyword.toLowerCase().includes("pin") ||
                        keyword.toLowerCase().includes("sạc") ||
                        keyword.toLowerCase().includes("sac") ||
                        keyword.toLowerCase().includes("bàn phím") ||
                        keyword.toLowerCase().includes("ban phim") ||
                        keyword.toLowerCase().includes("loa") ||
                        keyword.toLowerCase().includes("thẻ nhớ") ||
                        keyword.toLowerCase().includes("the nho") ||
                        keyword.toLowerCase().includes("usb") ||
                        keyword.toLowerCase().includes("đồng hồ") ||
                        keyword.toLowerCase().includes("dong ho") ||
                        keyword.toLowerCase().includes("gậy") ||
                        keyword.toLowerCase().includes("dán màn hình") ||
                        keyword.toLowerCase().includes("dan man hinh") ||
                        keyword.toLowerCase().includes("gay tu suong"))//search phụ kiện
                    {
                        argsSearchProduct = {
                            q: keyword,
                            CateID: -3
                        };
                    }
                    else {

                        argsSearchProduct = {
                            q: keyword,
                            CateID: -4
                        };
                    }

                    if (intent === "ask_old_stock")//xử lý máy cũ
                    {
                        fbMessage(sender, "Chức năng tìm máy cũ đang được phát triển...Xin lỗi vì sự bất tiện này!", questionTitle, button_payload_state, intent)
                            .catch(console.error);

                    }
                    else {

                        APIGetProductSearch(urlApiProduct, argsSearchProduct, function getResult(result) {

                            //console.log(result);
                            if (result.SearchProductPhiResult != null) {

                                console.log("================KẾT QUẢ SEARCH===============");
                                console.log(result.SearchProductPhiResult);

                                console.log("============================================");

                                var productID = result.SearchProductPhiResult.string[0];

                                var argsProductDetail = { intProductID: parseInt(productID), intProvinceID: 3 };
                                var lstproduct = result;

                                APIGetProductDetail(urlApiProduct, argsProductDetail, function getResult(result) {



                                    if (result && result.GetProductResult.productErpPriceBOField) {
                                        //lấy link sp
                                        var argsProductDetailGetSeoURL = {
                                            productCategoryLangBOField_uRLField: result.GetProductResult.productCategoryLangBOField.uRLField,
                                            productCategoryLangBOField_categoryNameField: result.GetProductResult.productCategoryLangBOField.categoryNameField,
                                            productCategoryBOField_uRLField: result.GetProductResult.productCategoryBOField.uRLField,
                                            productCategoryBOField_categoryNameField: result.GetProductResult.productCategoryBOField.categoryNameField,
                                            categoryNameField: result.GetProductResult.categoryNameField,
                                            productLanguageBOField_productNameField: result.GetProductResult.productLanguageBOField.productNameField,
                                            productLanguageBOField_uRLField: result.GetProductResult.productLanguageBOField.uRLField,
                                            productNameField: result.GetProductResult.productNameField,
                                            uRLField: result.GetProductResult.uRLField
                                        };


                                        //console.log(result);
                                        resultanswer = "Sản phẩm: " + result.GetProductResult.productNameField + "\n"
                                            + (result.GetProductResult.productErpPriceBOField.priceField == "0" ? ("") : ("Giá: " + parseFloat(result.GetProductResult.productErpPriceBOField.priceField).toLocaleString() + " đ"));
                                        console.log("Giá: " + result.GetProductResult.productErpPriceBOField.priceField.toString());

                                        APIGetSeoURLProduct(urlApiCategory, argsProductDetailGetSeoURL, function callback(seoURL) {

                                            resultanswer += "\nThông tin chi tiết sản phẩm: " + seoURL + "\n";

                                            if (parseInt(result.GetProductResult.productErpPriceBOField.webStatusIdField == 1) || (result.GetProductResult.productErpPriceBOField.priceField.toString() === "0")) {
                                                resultanswer += "\n" + "Sản phẩm bạn hỏi hiện tại ngừng kinh doanh. Vui lòng chọn sản phẩm khác ạ!";


                                                fbMessage(sender, resultanswer, questionTitle, button_payload_state, intent)
                                                    .catch(console.error);
                                            }
                                            else if (parseInt(result.GetProductResult.productErpPriceBOField.webStatusIdField == 2) || ((result.GetProductResult.productErpPriceBOField.priceField).toString() === "0")) {
                                                resultanswer += "\n" + "Sản phẩm bạn hỏi hiện tại đang tạm hết hàng. Vui lòng chọn sản phẩm khác ạ!";


                                                fbMessage(sender, resultanswer, questionTitle, button_payload_state, intent)
                                                    .catch(console.error);
                                            }
                                            else {

                                                //nếu có tỉnh/tp mới, reset lại huyện

                                                if (province && !district) {//có province, không có district

                                                    //lấy provinceID

                                                    var index = "locationdata";
                                                    var type = "province";
                                                    getElasticSearch(el, index, type, province, function callbackEL(err, result) {
                                                        if (err) return err;
                                                        //console.log(result);
                                                        if (result.length != 0) {//district được tìm thấy
                                                            var provinceID = result[0]._source.provinceID;
                                                            var provinceName = result[0]._source.provinceName;
                                                            sessions[sessionId].province = provinceName;
                                                            sessions[sessionId].provinveID = provinceID;

                                                            //console.log(provinceID);

                                                            //lấy danh sách siêu thị còn hàng
                                                            var total = 0;
                                                            var argsProductStock = "";
                                                            if (hasNumber(color)) {
                                                                argsProductStock = {
                                                                    productID: parseInt(productID), productCode: color, provinceID: provinceID,
                                                                    districtID: 0, pageSize: 10, pageIndex: pageIndexDefault, total
                                                                };
                                                            }
                                                            else {
                                                                argsProductStock = {
                                                                    productID: parseInt(productID), productCode: null, provinceID: provinceID,
                                                                    districtID: 0, pageSize: 10, pageIndex: pageIndexDefault, total
                                                                };
                                                            }

                                                            APICheckInStock(urlApiCategory, argsProductStock, function getResult(result) {
                                                                //console.log(argsProductStock);


                                                                // console.log(result.GetStoreInStock2016Result.StoreBO[1]);
                                                                // console.log(total);
                                                                if (result.total) {//có hàng
                                                                    resultanswer = "";

                                                                    resultanswer += "\nDanh sách siêu thị có hàng tại " + provinceName + "\n";
                                                                    for (var i = 0; i < result.GetStoreInStock2016Result.StoreBO.length; i++) {
                                                                        var storeBO = result.GetStoreInStock2016Result.StoreBO[i];
                                                                        resultanswer += (i + 1) + ". " + storeBO.webAddressField;
                                                                        resultanswer += " https://www.thegioididong.com/sieu-thi-so-" + storeBO.storeIDField + "\n";


                                                                    }

                                                                    resultanswer += "..................";



                                                                    fbMessage(sender, resultanswer, questionTitle, button_payload_state, intent)
                                                                        .catch(console.error);

                                                                    //lấy danh sách huyện của tỉnh đó

                                                                    var argsDistrictByProvince = { intProvinceID: parseInt(provinceID) };


                                                                    APIGetDistrictByProvince(urlApiCategory, argsDistrictByProvince, function getResult(result) {


                                                                        //console.log(result.GetDistricByProvinceResult.DistrictBO[0]);
                                                                        var length = result.GetDistricByProvinceResult.DistrictBO.length;
                                                                        resultanswer = "";
                                                                        resultanswer += "\nCHỌN QUẬN/HUYỆN CỦA BẠN ĐỂ KIỂM TRA CHÍNH XÁC HƠN? ";

                                                                        var type = "template";
                                                                        questionTitle = "Danh sách quận/huyện";

                                                                        var jsonmessageDistrict = '{' +
                                                                            '"recipient":' + '{' + '"id":' +
                                                                            '"' + sender + '"' +
                                                                            '},' +
                                                                            '"message":' + '{' +
                                                                            '"attachment":' + '{' +
                                                                            '"type":' + '"' + type + '"' + ',' +
                                                                            '"payload":' + '{' +
                                                                            '"template_type":"generic"' + ',' +
                                                                            '"elements":' + '[' +
                                                                            '{' +
                                                                            '"title":' + '"' + questionTitle + '"' + ',' +
                                                                            '"buttons":' + '[';

                                                                        var buttonGroup = 0;
                                                                        for (var i = 0; i < length; i++) {
                                                                            if (i > 26) break;
                                                                            var districbo = result.GetDistricByProvinceResult.DistrictBO[i];

                                                                            buttonGroup++;

                                                                            if (i == (length - 1)) {

                                                                                if (buttonGroup > 3) {
                                                                                    buttonGroup = 1;


                                                                                    jsonmessageDistrict += ']' + '}' + ',' +
                                                                                        '{' +
                                                                                        '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                        '"buttons":' + '[' +
                                                                                        '{' +
                                                                                        '"type":"postback"' + ',' +
                                                                                        '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                        '"payload":' + '"' + districbo.districtIDField + '"' + '}';

                                                                                }
                                                                                else {
                                                                                    jsonmessageDistrict += '{' +
                                                                                        '"type":"postback"' + ',' +
                                                                                        '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                        '"payload":' + '"' + districbo.districtIDField + '"' + '}';
                                                                                }

                                                                            }
                                                                            else {

                                                                                if (buttonGroup > 3) {
                                                                                    buttonGroup = 1;


                                                                                    jsonmessageDistrict += ']' + '}' + ',' +
                                                                                        '{' +
                                                                                        '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                        '"buttons":' + '[' +
                                                                                        '{' +
                                                                                        '"type":"postback"' + ',' +
                                                                                        '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                        '"payload":' + '"' + districbo.districtIDField + '"' + '}' + ',';

                                                                                }

                                                                                else {
                                                                                    if (buttonGroup == 3)//thăng cuoi cùng trong group button allow
                                                                                    {
                                                                                        jsonmessageDistrict += '{' +


                                                                                            '"type":"postback"' + ',' +
                                                                                            '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                            '"payload":' + '"' + districbo.districtIDField + '"' + '}';
                                                                                    }
                                                                                    else {
                                                                                        jsonmessageDistrict += '{' +


                                                                                            '"type":"postback"' + ',' +
                                                                                            '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                            '"payload":' + '"' + districbo.districtIDField + '"' + '}' + ',';

                                                                                    }

                                                                                }


                                                                            }


                                                                        }
                                                                        jsonmessageDistrict +=
                                                                            ']' +
                                                                            '}' +
                                                                            ']' +
                                                                            '}' +
                                                                            '}' +
                                                                            '}' +
                                                                            '}';

                                                                        var bodystring = JSON.parse(jsonmessageDistrict);
                                                                        var bodyjson = JSON.stringify(bodystring);


                                                                        console.log("===============BUTTON POSTBACK===================");
                                                                        console.log(bodyjson);


                                                                        fbMessagebutton(sender, bodyjson)
                                                                            .catch(console.error);
                                                                    });
                                                                }
                                                                else {//hết hàng
                                                                    fbMessage(sender, "Rất tiếc. Sản phẩm " + productName + " đã hết hàng HOẶC ĐANG NHẬP VỀ tại khu vực " + provinceName + " của bạn! Vui lòng chọn lại khu vực lân cận.", questionTitle, button_payload_state, intent)
                                                                        .catch(console.error);
                                                                }

                                                            });//end APIGetDistrictByProvince

                                                        }
                                                        else {

                                                            sessions[sessionId].province = null;
                                                            fbMessage(sender, "Không nhận diện được Tỉnh/Thành Phố bạn đang ở. Vui lòng cung cấp tỉnh/Thành trước. (VIẾT HOA CHỮ ĐẦU). Ví dụ: Phú Yên, Hồ Chí Minh, Hà Nội...", questionTitle, button_payload_state, intent)
                                                                .catch(console.error);

                                                        }

                                                    });//end elastic



                                                }
                                                else if (province && district) {

                                                    //console.log(province+"-"+district);


                                                    //lấy danh sách cửa hàng còn hàng ở tỉnh, huyện  đó không theo màu

                                                    var index = "locationdata";
                                                    var type = "district";
                                                    if (!(sessions[sessionId].provinveID))//th này là do detect đc cả tỉnh lẫn huyện trong 1 câu (phức tạp)
                                                    {
                                                        sessions[sessionId].provinveID = 3;//cho tránh trường hợp lỗi query elastic (lấy mặc định là HCM)
                                                    }
                                                    //tìm huyện theo tỉnh trước
                                                    getElasticSearchDistrictAndProvince(el, index, type, district, sessions[sessionId].provinveID, function callbackEL(err, result) {
                                                        if (err) return err;
                                                        if (result.length != 0) {
                                                            if (result.length == 1)//đã xác định đúng chính xác huyện và tỉnh đó
                                                            {
                                                                var provinceID = result[0]._source.provinceID;
                                                                var districtID = result[0]._source.districtID;
                                                                var districtName = result[0]._source.districtName;
                                                                var provinceName = province;

                                                                //console.log(provinceID);

                                                                //lấy danh sách siêu thị còn hàng
                                                                var total = 0;
                                                                var argsProductStock = "";
                                                                if (hasNumber(color)) {
                                                                    argsProductStock = {
                                                                        productID: parseInt(productID), productCode: color, provinceID: parseInt(provinceID),
                                                                        districtID: parseInt(districtID), pageSize: 20, pageIndex: pageIndexDefault, total
                                                                    };
                                                                }
                                                                else {
                                                                    argsProductStock = {
                                                                        productID: parseInt(productID), productCode: null, provinceID: parseInt(provinceID),
                                                                        districtID: parseInt(districtID), pageSize: 20, pageIndex: pageIndexDefault, total
                                                                    };
                                                                }
                                                                APICheckInStock(urlApiCategory, argsProductStock, function getResult(result) {
                                                                    //console.log(argsProductStock);
                                                                    //console.log("Tham số truyền vào Check Stock:\n" + JSON.parse(argsProductStock));

                                                                    // console.log(result.GetStoreInStock2016Result.StoreBO[1]);
                                                                    if (result.total > 0 && result.GetStoreInStock2016Result.StoreBO.length > 1 && result.GetStoreInStock2016Result.StoreBO[0].webAddressField != "undefined") {//có hàng

                                                                        // console.log(total);
                                                                        resultanswer = "";

                                                                        if (color && hasNumber(color)) {
                                                                            resultanswer += "\nDanh sách siêu thị có sản phẩm màu " + sessions[sessionId].colorname.toUpperCase() + " tại " + districtName + "," + provinceName + "\n";
                                                                        }
                                                                        else {
                                                                            resultanswer += "\nDanh sách siêu thị có sản phẩm có hàng tại " + districtName + "," + provinceName + "\n";
                                                                        }
                                                                        for (var i = 0; i < result.GetStoreInStock2016Result.StoreBO.length; i++) {
                                                                            var storeBO = result.GetStoreInStock2016Result.StoreBO[i];
                                                                            if (storeBO.webAddressField && storeBO.webAddressField != "undefined") {
                                                                                resultanswer += (i + 1) + ". " + storeBO.webAddressField + "\n";
                                                                                resultanswer += " https://www.thegioididong.com/sieu-thi-so-" + storeBO.storeIDField + "\n";
                                                                            }



                                                                        }
                                                                        fbMessage(sender, resultanswer, questionTitle, button_payload_state, intent)
                                                                            .catch(console.error);
                                                                        resultanswer = "";
                                                                        //nếu có hỏi màu, gợi ý thêm danh sách màu
                                                                        //không hỏi thì kệ nó :v
                                                                        //if (color) {
                                                                        setTimeout(function () { resultanswer += "Vui lòng chọn màu sắc bạn quan tâm để xem danh sách cửa hàng còn hàng!" }, 1000);

                                                                        var argsProductColor = { intProductID: parseInt(productID), LangID: "vi-VN" };
                                                                        APIGetProductColor(urlwcfProduct, argsProductColor, function getResult(result) {


                                                                            //console.log(result.GetDistricByProvinceResult.DistrictBO[0]);
                                                                            var length = result.GetProductColorByProductIDLangResult.ProductColorBO.length;
                                                                            resultanswer = "Sảm phẩm " + productName + " hiện tại có các màu sau: \n";
                                                                            if (length > 3) {
                                                                                //nếu có nhiều hơn 3 màu, in danh sách màu
                                                                                for (var i = 0; i < length; i++) {
                                                                                    var colorBo = result.GetProductColorByProductIDLangResult.ProductColorBO[i];
                                                                                    resultanswer += colorBo.colorname + " , ";

                                                                                }

                                                                            }

                                                                            //resultanswer += "\nCHỌN MÀU SẮC BẠN QUAN TÂM CHO SẢN PHẨM ĐỂ KIỂM TRA CHÍNH XÁC HƠN? ";

                                                                            var type = "template";
                                                                            questionTitle = "Danh sách màu sắc";

                                                                            var jsoncolortemplate = '{' +
                                                                                '"recipient":' + '{' + '"id":' +
                                                                                '"' + sender + '"' +
                                                                                '},' +
                                                                                '"message":' + '{' +
                                                                                '"attachment":' + '{' +
                                                                                '"type":' + '"' + type + '"' + ',' +
                                                                                '"payload":' + '{' +
                                                                                '"template_type":"generic"' + ',' +
                                                                                '"elements":' + '[' +
                                                                                '{' +
                                                                                '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                '"buttons":' + '[';

                                                                            var buttonGroup = 0;
                                                                            for (var i = 0; i < length; i++) {
                                                                                var colorBo = result.GetProductColorByProductIDLangResult.ProductColorBO[i];
                                                                                //console.log(colorBo);

                                                                                buttonGroup++;

                                                                                if (i == (length - 1)) {

                                                                                    if (buttonGroup > 3) {
                                                                                        buttonGroup = 1;


                                                                                        jsoncolortemplate += ']' + '}' + ',' +
                                                                                            '{' +
                                                                                            '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                            '"buttons":' + '[' +
                                                                                            '{' +
                                                                                            '"type":"postback"' + ',' +
                                                                                            '"title":' + '"' + colorBo.ColorName + '"' + ',' +
                                                                                            '"payload":' + '"' + colorBo.ProductCode + '"' + '}';

                                                                                    }
                                                                                    else {
                                                                                        jsoncolortemplate += '{' +
                                                                                            '"type":"postback"' + ',' +
                                                                                            '"title":' + '"' + colorBo.ColorName + '"' + ',' +
                                                                                            '"payload":' + '"' + colorBo.ProductCode + '"' + '}';
                                                                                    }

                                                                                }
                                                                                else {

                                                                                    if (buttonGroup > 3) {
                                                                                        buttonGroup = 1;


                                                                                        jsoncolortemplate += ']' + '}' + ',' +
                                                                                            '{' +
                                                                                            '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                            '"buttons":' + '[' +
                                                                                            '{' +
                                                                                            '"type":"postback"' + ',' +
                                                                                            '"title":' + '"' + colorBo.ColorName + '"' + ',' +
                                                                                            '"payload":' + '"' + colorBo.ProductCode + '"' + '}' + ',';

                                                                                    }

                                                                                    else {
                                                                                        if (buttonGroup == 3)//thăng cuoi cùng trong group button allow
                                                                                        {
                                                                                            jsoncolortemplate += '{' +


                                                                                                '"type":"postback"' + ',' +
                                                                                                '"title":' + '"' + colorBo.ColorName + '"' + ',' +
                                                                                                '"payload":' + '"' + colorBo.ProductCode + '"' + '}';
                                                                                        }
                                                                                        else {
                                                                                            jsoncolortemplate += '{' +


                                                                                                '"type":"postback"' + ',' +
                                                                                                '"title":' + '"' + colorBo.ColorName + '"' + ',' +
                                                                                                '"payload":' + '"' + colorBo.ProductCode + '"' + '}' + ',';

                                                                                        }

                                                                                    }


                                                                                }


                                                                            }
                                                                            jsoncolortemplate +=
                                                                                ']' +
                                                                                '}' +
                                                                                ']' +
                                                                                '}' +
                                                                                '}' +
                                                                                '}' +
                                                                                '}';

                                                                            var bodystring = JSON.parse(jsoncolortemplate);
                                                                            var bodyjson = JSON.stringify(bodystring);

                                                                            //console.log(bodyjson);
                                                                            //xóa màu cũ đi
                                                                            sessions[sessionId].color = null;
                                                                            sessions[sessionId].colorname = null;

                                                                            fbMessagebutton(sender, bodyjson)
                                                                                .catch(console.error);
                                                                        });//end APIGetProductColor
                                                                        //}//end if color
                                                                        //else {
                                                                        //resultanswer = "Vui lòng chọn màu sắc bạn quan tâm để xem danh sách cửa hàng còn hàng!"
                                                                        //}

                                                                    }//end if(result)
                                                                    else {
                                                                        //sessions[sessionId].province = null;
                                                                        //sessions[sessionId].district = null;

                                                                        if (color && hasNumber(color)) {


                                                                            resultanswer = "Rất tiếc. Sản phẩm có màu " + sessions[sessionId].colorname.toUpperCase() + " đã hết hàng tại khu vực của bạn! Vui lòng chọn lại khu vực lân cận."


                                                                            //suggest khu vực

                                                                            var argsDistrictByProvince = { intProvinceID: parseInt(provinceID) };


                                                                            APIGetDistrictByProvince(urlApiCategory, argsDistrictByProvince, function getResult(result) {


                                                                                //console.log(result.GetDistricByProvinceResult.DistrictBO[0]);
                                                                                var length = result.GetDistricByProvinceResult.DistrictBO.length;
                                                                                resultanswer = "";
                                                                                //resultanswer += "\nCHỌN QUẬN/HUYỆN CỦA BẠN ĐỂ KIỂM TRA CHÍNH XÁC HƠN? ";

                                                                                var type = "template";
                                                                                questionTitle = "Danh sách quận/huyện";

                                                                                var jsonmessageDistrict = '{' +
                                                                                    '"recipient":' + '{' + '"id":' +
                                                                                    '"' + sender + '"' +
                                                                                    '},' +
                                                                                    '"message":' + '{' +
                                                                                    '"attachment":' + '{' +
                                                                                    '"type":' + '"' + type + '"' + ',' +
                                                                                    '"payload":' + '{' +
                                                                                    '"template_type":"generic"' + ',' +
                                                                                    '"elements":' + '[' +
                                                                                    '{' +
                                                                                    '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                    '"buttons":' + '[';

                                                                                var buttonGroup = 0;
                                                                                for (var i = 0; i < length; i++) {
                                                                                    if (i > 26) break;
                                                                                    var districbo = result.GetDistricByProvinceResult.DistrictBO[i];

                                                                                    buttonGroup++;

                                                                                    if (i == (length - 1)) {

                                                                                        if (buttonGroup > 3) {
                                                                                            buttonGroup = 1;


                                                                                            jsonmessageDistrict += ']' + '}' + ',' +
                                                                                                '{' +
                                                                                                '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                                '"buttons":' + '[' +
                                                                                                '{' +
                                                                                                '"type":"postback"' + ',' +
                                                                                                '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                                '"payload":' + '"' + districbo.districtIDField + '"' + '}';

                                                                                        }
                                                                                        else {
                                                                                            jsonmessageDistrict += '{' +
                                                                                                '"type":"postback"' + ',' +
                                                                                                '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                                '"payload":' + '"' + districbo.districtIDField + '"' + '}';
                                                                                        }

                                                                                    }
                                                                                    else {

                                                                                        if (buttonGroup > 3) {
                                                                                            buttonGroup = 1;


                                                                                            jsonmessageDistrict += ']' + '}' + ',' +
                                                                                                '{' +
                                                                                                '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                                '"buttons":' + '[' +
                                                                                                '{' +
                                                                                                '"type":"postback"' + ',' +
                                                                                                '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                                '"payload":' + '"' + districbo.districtIDField + '"' + '}' + ',';

                                                                                        }

                                                                                        else {
                                                                                            if (buttonGroup == 3)//thăng cuoi cùng trong group button allow
                                                                                            {
                                                                                                jsonmessageDistrict += '{' +


                                                                                                    '"type":"postback"' + ',' +
                                                                                                    '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                                    '"payload":' + '"' + districbo.districtIDField + '"' + '}';
                                                                                            }
                                                                                            else {
                                                                                                jsonmessageDistrict += '{' +


                                                                                                    '"type":"postback"' + ',' +
                                                                                                    '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                                    '"payload":' + '"' + districbo.districtIDField + '"' + '}' + ',';

                                                                                            }

                                                                                        }


                                                                                    }


                                                                                }
                                                                                jsonmessageDistrict +=
                                                                                    ']' +
                                                                                    '}' +
                                                                                    ']' +
                                                                                    '}' +
                                                                                    '}' +
                                                                                    '}' +
                                                                                    '}';

                                                                                var bodystring = JSON.parse(jsonmessageDistrict);
                                                                                var bodyjson = JSON.stringify(bodystring);


                                                                                //console.log("===============BUTTON POSTBACK===================");
                                                                                //console.log(bodyjson);


                                                                                fbMessagebutton(sender, bodyjson)
                                                                                    .catch(console.error);
                                                                            });

                                                                            //===================================================================



                                                                            //reset color
                                                                            //sessions[sessionId].color = null;
                                                                            //sessions[sessionId].colorname = null;


                                                                        }
                                                                        else {
                                                                            resultanswer = "Rất tiếc. Sản phẩm đã hết hàng tại khu vực " + districtName + " của bạn! Vui lòng chọn lại khu vực lân cận.";

                                                                            //suggest khu vực
                                                                            var argsDistrictByProvince = { intProvinceID: parseInt(provinceID) };
                                                                            //=======================================================================
                                                                            APIGetDistrictByProvince(urlApiCategory, argsDistrictByProvince, function getResult(result) {


                                                                                //console.log(result.GetDistricByProvinceResult.DistrictBO[0]);
                                                                                var length = result.GetDistricByProvinceResult.DistrictBO.length;
                                                                                resultanswer = "";
                                                                                //resultanswer += "\nCHỌN QUẬN/HUYỆN CỦA BẠN ĐỂ KIỂM TRA CHÍNH XÁC HƠN? ";

                                                                                var type = "template";
                                                                                questionTitle = "Danh sách quận/huyện";

                                                                                var jsonmessageDistrict = '{' +
                                                                                    '"recipient":' + '{' + '"id":' +
                                                                                    '"' + sender + '"' +
                                                                                    '},' +
                                                                                    '"message":' + '{' +
                                                                                    '"attachment":' + '{' +
                                                                                    '"type":' + '"' + type + '"' + ',' +
                                                                                    '"payload":' + '{' +
                                                                                    '"template_type":"generic"' + ',' +
                                                                                    '"elements":' + '[' +
                                                                                    '{' +
                                                                                    '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                    '"buttons":' + '[';

                                                                                var buttonGroup = 0;
                                                                                for (var i = 0; i < length; i++) {
                                                                                    if (i > 26) break;
                                                                                    var districbo = result.GetDistricByProvinceResult.DistrictBO[i];

                                                                                    buttonGroup++;

                                                                                    if (i == (length - 1)) {

                                                                                        if (buttonGroup > 3) {
                                                                                            buttonGroup = 1;


                                                                                            jsonmessageDistrict += ']' + '}' + ',' +
                                                                                                '{' +
                                                                                                '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                                '"buttons":' + '[' +
                                                                                                '{' +
                                                                                                '"type":"postback"' + ',' +
                                                                                                '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                                '"payload":' + '"' + districbo.districtIDField + '"' + '}';

                                                                                        }
                                                                                        else {
                                                                                            jsonmessageDistrict += '{' +
                                                                                                '"type":"postback"' + ',' +
                                                                                                '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                                '"payload":' + '"' + districbo.districtIDField + '"' + '}';
                                                                                        }

                                                                                    }
                                                                                    else {

                                                                                        if (buttonGroup > 3) {
                                                                                            buttonGroup = 1;


                                                                                            jsonmessageDistrict += ']' + '}' + ',' +
                                                                                                '{' +
                                                                                                '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                                '"buttons":' + '[' +
                                                                                                '{' +
                                                                                                '"type":"postback"' + ',' +
                                                                                                '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                                '"payload":' + '"' + districbo.districtIDField + '"' + '}' + ',';

                                                                                        }

                                                                                        else {
                                                                                            if (buttonGroup == 3)//thăng cuoi cùng trong group button allow
                                                                                            {
                                                                                                jsonmessageDistrict += '{' +


                                                                                                    '"type":"postback"' + ',' +
                                                                                                    '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                                    '"payload":' + '"' + districbo.districtIDField + '"' + '}';
                                                                                            }
                                                                                            else {
                                                                                                jsonmessageDistrict += '{' +


                                                                                                    '"type":"postback"' + ',' +
                                                                                                    '"title":' + '"' + districbo.districtNameField + '"' + ',' +
                                                                                                    '"payload":' + '"' + districbo.districtIDField + '"' + '}' + ',';

                                                                                            }

                                                                                        }


                                                                                    }


                                                                                }
                                                                                jsonmessageDistrict +=
                                                                                    ']' +
                                                                                    '}' +
                                                                                    ']' +
                                                                                    '}' +
                                                                                    '}' +
                                                                                    '}' +
                                                                                    '}';

                                                                                var bodystring = JSON.parse(jsonmessageDistrict);
                                                                                var bodyjson = JSON.stringify(bodystring);


                                                                                //console.log("===============BUTTON POSTBACK===================");
                                                                                //console.log(bodyjson);


                                                                                fbMessagebutton(sender, bodyjson)
                                                                                    .catch(console.error);
                                                                            });

                                                                            //=======================================================================


                                                                        }

                                                                    }

                                                                    fbMessage(sender, resultanswer, questionTitle, button_payload_state, intent)
                                                                        .catch(console.error);

                                                                });//end APICheckInStock
                                                            }
                                                            else {//nếu ra quá nhiều thì suggest ra quận huyện nào thành phố đó (3 kết quả tối đa)

                                                                resultanswer = "";
                                                                resultanswer += "Ý BẠN LÀ GÌ ?\n ";


                                                                var type = "template";
                                                                questionTitle = "Ý bạn có phải là ?";

                                                                var jsonmessageDistrict = '{' +
                                                                    '"recipient":' + '{' + '"id":' +
                                                                    '"' + sender + '"' +
                                                                    '},' +
                                                                    '"message":' + '{' +
                                                                    '"attachment":' + '{' +
                                                                    '"type":' + '"' + type + '"' + ',' +
                                                                    '"payload":' + '{' +
                                                                    '"template_type":"generic"' + ',' +
                                                                    '"elements":' + '[' +
                                                                    '{' +
                                                                    '"title":' + '"' + questionTitle + '"' + ',' +
                                                                    '"buttons":' + '[';

                                                                for (var i = 0; i < result.length; i++) {//lấy tối đa 6
                                                                    if (i > 5) break;
                                                                    var resultEach = result[i]._source;
                                                                    if (i == 2 || i == 5 || i == result.length - 1) {
                                                                        if (i == result.length - 1 && i == 3) {//chuyển
                                                                            jsonmessageDistrict += ']' + '}' + ',' +
                                                                                '{' +
                                                                                '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                '"buttons":' + '[' +
                                                                                '{' +
                                                                                '"type":"postback"' + ',' +
                                                                                '"title":' + '"' + resultEach.districtName + '"' + ',' +
                                                                                '"payload":' + '"' + resultEach.districtID + '"' + '}';
                                                                        }
                                                                        else {
                                                                            jsonmessageDistrict += '{' +
                                                                                '"type":"postback"' + ',' +
                                                                                '"title":' + '"' + resultEach.districtName + '"' + ',' +
                                                                                '"payload":' + '"' + resultEach.districtID + '"' + '}';
                                                                        }
                                                                    }
                                                                    else {
                                                                        if (i == 3) {

                                                                            jsonmessageDistrict += ']' + '}' + ',' +
                                                                                '{' +
                                                                                '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                '"buttons":' + '[' +
                                                                                '{' +
                                                                                '"type":"postback"' + ',' +
                                                                                '"title":' + '"' + resultEach.districtName + '"' + ',' +
                                                                                '"payload":' + '"' + resultEach.districtID + '"' + '}' + ',';
                                                                        }
                                                                        else {
                                                                            jsonmessageDistrict += '{' +
                                                                                '"type":"postback"' + ',' +
                                                                                '"title":' + '"' + resultEach.districtName + '"' + ',' +
                                                                                '"payload":' + '"' + resultEach.districtID + '"' + '}' + ',';
                                                                        }


                                                                    }

                                                                }
                                                                jsonmessageDistrict +=
                                                                    ']' +
                                                                    '}' +
                                                                    ']' +
                                                                    '}' +
                                                                    '}' +
                                                                    '}' +
                                                                    '}';

                                                                var bodystring = JSON.parse(jsonmessageDistrict);
                                                                var bodyjson = JSON.stringify(bodystring);

                                                                //console.log(bodyjson);
                                                                fbMessagebutton(sender, bodyjson)
                                                                    .catch(console.error);
                                                            }

                                                        }
                                                        else {//trường hợp này có thể là tỉnh/thành phố một đằng (ID) mà huyện/quận lại một nẻo

                                                            //Dùng elastic, search theo đơn vị nhỏ nhất là quận/huyện (không theo province ID), Suggest ra tầm 3 kết quả 

                                                            var index1 = "locationdata";
                                                            var type1 = "district";
                                                            getElasticSearch(el, index1, type1, province, function callbackEL(err, result) {
                                                                if (err) return err;
                                                                //console.log(result);
                                                                if (result.length != 0) {//address được tìm thấy
                                                                    var provinceID = result[0]._source.provinceID;
                                                                    var districtName = result[0]._source.districtName;
                                                                    sessions[sessionId].province = districtName.split(",");
                                                                    sessions[sessionId].provinveID = provinceID;


                                                                    resultanswer = "";
                                                                    resultanswer += "CÓ PHẢI Ý BẠN LÀ CÁC ĐỊA CHỈ DƯỚI ĐÂY KHÔNG ?\n ";


                                                                    var type = "template";
                                                                    questionTitle = "Ý bạn là ?";

                                                                    var jsonmessageDistrict = '{' +
                                                                        '"recipient":' + '{' + '"id":' +
                                                                        '"' + sender + '"' +
                                                                        '},' +
                                                                        '"message":' + '{' +
                                                                        '"attachment":' + '{' +
                                                                        '"type":' + '"' + type + '"' + ',' +
                                                                        '"payload":' + '{' +
                                                                        '"template_type":"generic"' + ',' +
                                                                        '"elements":' + '[' +
                                                                        '{' +
                                                                        '"title":' + '"' + questionTitle + '"' + ',' +
                                                                        '"buttons":' + '[';

                                                                    for (var i = 0; i < result.length; i++) {//lấy tối đa 6
                                                                        if (i > 5) break;
                                                                        var resultEach = result[i]._source;
                                                                        if (i == 2 || i == 5 || i == result.length - 1) {

                                                                            if (i == result.length - 1 && i == 3) {//chuyển
                                                                                jsonmessageDistrict += ']' + '}' + ',' +
                                                                                    '{' +
                                                                                    '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                    '"buttons":' + '[' +
                                                                                    '{' +
                                                                                    '"type":"postback"' + ',' +
                                                                                    '"title":' + '"' + resultEach.districtName + '"' + ',' +
                                                                                    '"payload":' + '"' + resultEach.districtID + '"' + '}';
                                                                            }
                                                                            else {

                                                                            }
                                                                            jsonmessageDistrict += '{' +
                                                                                '"type":"postback"' + ',' +
                                                                                '"title":' + '"' + resultEach.districtName + '"' + ',' +
                                                                                '"payload":' + '"' + resultEach.districtID + '"' + '}';
                                                                        }
                                                                        else {
                                                                            if (i == 3) {

                                                                                jsonmessageDistrict += ']' + '}' + ',' +
                                                                                    '{' +
                                                                                    '"title":' + '"' + questionTitle + '"' + ',' +
                                                                                    '"buttons":' + '[' +
                                                                                    '{' +
                                                                                    '"type":"postback"' + ',' +
                                                                                    '"title":' + '"' + resultEach.districtName + '"' + ',' +
                                                                                    '"payload":' + '"' + resultEach.districtID + '"' + '}' + ',';
                                                                            }
                                                                            else {
                                                                                jsonmessageDistrict += '{' +
                                                                                    '"type":"postback"' + ',' +
                                                                                    '"title":' + '"' + resultEach.districtName + '"' + ',' +
                                                                                    '"payload":' + '"' + resultEach.districtID + '"' + '}' + ',';
                                                                            }


                                                                        }

                                                                    }
                                                                    jsonmessageDistrict +=
                                                                        ']' +
                                                                        '}' +
                                                                        ']' +
                                                                        '}' +
                                                                        '}' +
                                                                        '}' +
                                                                        '}';

                                                                    var bodystring = JSON.parse(jsonmessageDistrict);
                                                                    var bodyjson = JSON.stringify(bodystring);

                                                                    //console.log(bodyjson);
                                                                    fbMessagebutton(sender, bodyjson)
                                                                        .catch(console.error);
                                                                }

                                                                else {

                                                                    fbMessage(sender, "Không nhận diện được Tỉnh/Thành Phố bạn đang ở. Vui lòng cung cấp tỉnh/Thành trước. (VIẾT HOA CHỮ ĐẦU). Ví dụ: Phú Yên, Hồ Chí Minh, Hà Nội...", questionTitle, button_payload_state, intent)
                                                                        .catch(console.error);
                                                                }



                                                            });//end getElasticSearch


                                                            sessions[sessionId].district = null;
                                                            //sessions[sessionId].province = null;


                                                            //fbMessage(sender, "Không nhận diện được địa chỉ. Vui lòng cung cấp tỉnh/thành phố trước (VIẾT HOA CHỮ ĐẦU), ví dụ: Hồ Chí Minh, Hà Nội, Phú Yên...", questionTitle, button_payload_state, intent)
                                                            //    .catch(console.error);

                                                        }

                                                    });//end getElasticSearchDistrictAndProvince

                                                    //suggest thêm màu để chọn                                        

                                                }//end if(product && province)
                                                else if (!province && district)//khong có tỉnh, chỉ có huyện/quận
                                                {
                                                    resultanswer = "\nBạn đang ở Tỉnh/Thành phố nào ạ? Vui lòng cung cấp tỉnh/thành phố trước (VIẾT HOA CHỮ ĐẦU), ví dụ: Hồ Chí Minh, Hà Nội, Phú Yên...";
                                                }
                                                else {//chỉ có product

                                                    resultanswer += "\nVui lòng cung cấp tên tỉnh/thành phố để xem siêu thị có hàng (VIẾT HOA CHỮ ĐẦU) Ví dụ: Hồ Chí Minh, Phú Yên, Cần Thơ...";

                                                }

                                                console.log("Sản phẩm hỏi: " + productName);
                                                fbMessage(sender, resultanswer, questionTitle, button_payload_state, intent)
                                                    .catch(console.error);
                                            }

                                        });
                                    }

                                    else {
                                        resultanswer = "Sản phẩm " + result.GetProductResult.productNameField + " hiện tại không kinh doanh tại Thế giới di động. Vui lòng hỏi sản phẩm khác.";
                                        fbMessage(sender, resultanswer, questionTitle, button_payload_state, intent)
                                            .catch(console.error);
                                    }



                                });


                                ////============================================================================================
                                ////gợi ý thêm 3 sản phẩm liên quan

                                //questionTitle = "Danh sách sản phẩm liên quan !";

                                //var type = "template";

                                //var jsonmessageDistrict = '{' +
                                //    '"recipient":' + '{' + '"id":' +
                                //    '"' + sender + '"' +
                                //    '},' +
                                //    '"message":' + '{' +
                                //    '"attachment":' + '{' +
                                //    '"type":' + '"' + type + '"' + ',' +
                                //    '"payload":' + '{' +
                                //    '"template_type":"generic"' + ',' +
                                //    '"elements":' + '[' +
                                //    '{' +
                                //    '"title":' + '"' + questionTitle + '"' + ',' +
                                //    '"buttons":' + '[';

                                //for (var i = 0; i < result.length; i++) {//lấy tối đa 6
                                //    if (i > 2) break;
                                //    var resultEach = result[i]._source;
                                //    if (i == 2 || i == result.length - 1) {

                                //        jsonmessageDistrict += '{' +
                                //            '"type":"postback"' + ',' +
                                //            '"title":' + '"' + resultEach.districtName + '"' + ',' +
                                //            '"payload":' + '"' + resultEach.districtID + '"' + '}';

                                //    }
                                //    else {
                                //        jsonmessageDistrict += '{' +
                                //            '"type":"postback"' + ',' +
                                //            '"title":' + '"' + resultEach.districtName + '"' + ',' +
                                //            '"payload":' + '"' + resultEach.districtID + '"' + '}' + ',';



                                //    }

                                //}
                                //jsonmessageDistrict +=
                                //    ']' +
                                //    '}' +
                                //    ']' +
                                //    '}' +
                                //    '}' +
                                //    '}' +
                                //    '}';

                                //var bodystring = JSON.parse(jsonmessageDistrict);

                                //var bodyjson = JSON.stringify(bodystring);

                                ////console.log(bodyjson);
                                //fbMessagebutton(sender, bodyjson)
                                //    .catch(console.error);
                                ////============================================================================================
                            }

                            else {
                                resultanswer = "Mình không nhận diện được sản phẩm/hoặc sản phẩm không tồn tại. Vui lòng nói rõ hơn về tên sản phẩm! Hoặc có thể nói ít từ khóa hơn. Ví dụ: sạc iphone, iphonex, iphone 5s...";
                                fbMessage(sender, resultanswer, questionTitle, button_payload_state, intent)
                                    .catch(console.error);

                            }

                        });
                    }

                }//end if (sessions[sessionId].product)

                else {
                    resultanswer = "Vui lòng cung cấp tên sản phẩm!";
                }

            }
            else if (intent === "ask_promotion") {
                resultanswer += "Bên mình hiện tại chưa có khuyễn mãi nào ạ...\n";
                resultanswer += "Bạn có thể cung cấp cho mình số điện thoại để bên mình có thể liên lạc tư vấn cho bạn tốt hơn. ";
                intent = "ask_promotion";
                sessions[sessionId].prev_intent = "ask_promotion";
            }
            else if (intent === "offense") {
                if (json.text.toLowerCase().includes("chào")) {
                    resultanswer += "Hi bạn. Bạn có rảnh không? Rảnh thì mua điện thoại ở công ty Thế Giới Di Động của mình. Bảo đảm là \"Danh bất hư truyền\". :p";
                }
                else {
                    resultanswer += "Wow! À thật ra là mình không hiểu ý của bạn lắm. Bạn có thể nói lại rõ hơn được không. :p ";
                }
                //var resultanswer2 = "Bạn có rảnh không? Rảnh thì mua điện thoại ở công ty Thế Giới Di Động của mình. Bảo đảm là \"Danh bất hư truyền\". :p"

                intent = "offense";
                sessions[sessionId].prev_intent = "offense";
            }
            else if (intent === "ask_instalment") {
                questionTitle = "Thông tin trả góp!";
                if (entities.length == 0) {

                    resultanswer = "Về thủ tục trả góp, cách thức trả góp, bạn vui lòng liên hệ SĐT 1800.1060 (miễn phí cuộc gọi) để được trả lời cụ thể nha. ";
                }
                else {
                    resultanswer = "Thông tin trả góp" + "\n";
                    resultanswer += "Đang tra cứu. Vui lòng chờ....";

                    resultanswer += "\nChức năng thông tin trả góp đang phát triển. Xin lỗi vì sự bất tiện này!"

                }
                resultanswer += "Bạn có thể cung cấp cho mình số điện thoại để bên mình có thể liên lạc tư vấn cho bạn tốt hơn. ";
                intent = "ask_instalment";
                sessions[sessionId].prev_intent = "ask_instalment";
            }
            else if (intent === "ask_consultant") {
                questionTitle = "Tư vấn sản phẩm.";
                resultanswer = "Danh sách sản phẩm" + "\n";
                resultanswer += "Đang tra cứu. Vui lòng chờ....";

                resultanswer += "\nChức năng tư vấn sản phẩm đang phát triển. Xin lỗi vì sự bất tiện này!"
                resultanswer += "Bạn có thể cung cấp cho mình số điện thoại để bên mình có thể liên lạc tư vấn cho bạn tốt hơn. ";
                intent = "ask_consultant";
                sessions[sessionId].prev_intent = "ask_consultant";

                sessions[sessionId].product = null;
            }


            else if (intent === "ask_name") {
                questionTitle = "Hỏi tên";
                resultanswer = "Tên mình là Fiona Bot. Mình được tạo ra bởi tập đoàn Thế giới di động (MWG). Bạn có gì cần trợ giúp ạ?" + "\n";

                intent = "ask_name";
                sessions[sessionId].prev_intent = "ask_name";
            }

            else if (intent === "felling_love") {
                questionTitle = "Cảm xúc";
                resultanswer = "I love you too much. Nếu bạn mua sản phẩm ở của công ty mình, mình với bạn sẽ là bạn tốt của nhau. Hihi!" + "\n";

                intent = "felling_love";
                sessions[sessionId].prev_intent = "felling_love";
            }

            else if (intent === "felling_price") {
                questionTitle = "Cảm xúc giá";
                resultanswer = "Giá như vậy là rất hợp lý rồi bạn. Hàng ở công ty mình ngon về Chất Lượng, rẻ về Giá Cả, tốt về Dịch Vụ nên bạn yên tâm mua nha. Hihi" + "\n";

                //suggest kh
                intent = "felling_price";
                sessions[sessionId].prev_intent = "felling_price";
            }
            else if (intent === "ask_delivery") {
                questionTitle = "Giao hàng";
                resultanswer = "Chức năng giao hàng đang được phát triển... Xin lỗi bạn vì sự bất tiện này!";
                resultanswer += "Bạn có thể cung cấp cho mình số điện thoại để bên mình có thể liên lạc tư vấn cho bạn tốt hơn. ";

                //suggest kh
                intent = "ask_delivery";
                sessions[sessionId].prev_intent = "ask_delivery";
            }
            else if (intent === "ask_compare") {
                questionTitle = "So sánh";
                resultanswer = "Muốn so sánh lựa chọn, vui lòng truy cập https://www.thegioididong.com/hoi-dap để được trả lời cụ thể hơn nha bạn!";

                resultanswer += "Bạn có thể cung cấp cho mình số điện thoại để bên mình có thể liên lạc tư vấn cho bạn tốt hơn. ";

                //suggest kh
                intent = "ask_compare";
                sessions[sessionId].prev_intent = "ask_compare";
            }
            else if (intent == "ans_tel") {
                resultanswer = "Cảm ơn bạn.Chúng tôi sẽ liên hệ bạn sớm nhất có thể. Bạn có thể hỏi thông tin sản phẩm khác ạ.";
            }
            else {
                resultanswer = "Mình là Fiona Bot. Mình chưa rõ câu hỏi của bạn lắm. Bạn vui lòng cung cấp rõ thông tin cần hỏi như: tên sản phẩm, giá cả, địa chỉ...Cảm ơn bạn";

            }


        }

        fbMessage(sender, resultanswer, questionTitle, button_payload_state, intent)
            .catch(console.error);
        //console.log(resultanswer);
    });

};

const responsepostbackgreet = (sender, sessionId, button_payload_state) => {

    var resultanswer = ""
    var questionTitle = "";
    if (button_payload_state == "1") {
        questionTitle = "Hỏi thông tin sản phẩm"
        resultanswer = "Bạn muốn hỏi thông tin sản phẩm nào ạ?"
    }
    else if (button_payload_state == "2") {
        questionTitle = "Hỏi giá sản phẩm"
        resultanswer = "Bạn muốn hỏi giá sản phẩm nào ạ?"
    }
    else if (button_payload_state == "3") {
        questionTitle = "Hỏi trả góp sản phẩm"
        resultanswer = "Bạn muốn hỏi trả góp cho sản phẩm nào ạ?"
    }

    fbMessage(sender, resultanswer, questionTitle, parseInt(button_payload_state))
        .catch(console.error);


};


const responsepostbackdistric = (sender, sessionId, districID) => {

    var sever = severRasaQuery;
    var url = encodeURI(sever);

    var button_payload_state = districID;//không có gì, 1: hoi sp, 2: hỏi giá, 3: hỏi trả góp


    getJsonAndAnalyze(url, sender, sessionId, button_payload_state);


};

const responsepostbackcolor = (sender, sessionId, productCode, colorname) => {

    var sever = severRasaQuery;
    var url = encodeURI(sever);

    var button_payload_state = productCode;//không có gì, 1: hoi sp, 2: hỏi giá, 3: hỏi trả góp

    sessions[sessionId].colorname = colorname;
    getJsonAndAnalyze(url, sender, sessionId, button_payload_state);
};
const responsepostbackFeedback = (sender, sessionId, feedback) => {
    var sever = severRasaQuery;
    var url = encodeURI(sever);

    var button_payload_state = feedback;


    getJsonAndAnalyze(url, sender, sessionId, button_payload_state);

};

var webhookController = {
    index: function (req, res) {

        if (req.query['hub.mode'] === 'subscribe' &&
            req.query['hub.verify_token'] === 'rasa-bot') {
            res.send(req.query['hub.challenge']);
        } else {
            res.sendStatus(400);
        }


    },
    postmessage: function (req, res) {

        const data = req.body;
        console.log(data);
        //console.log('fbmessage=' + JSON.stringify(req.body));
        if (data.object === 'page') {
            data.entry.forEach(entry => {
                entry.messaging.forEach(event => {
                    if ((event.message && !event.message.is_echo)) {//xu ly message tu user
                        // Yay! We got a new message!
                        // We retrieve the Facebook user ID of the sender
                        const sender = event.sender.id;


                        // We retrieve the user's current session, or create one if it doesn't exist
                        // This is needed for our bot to figure out the conversation history
                        const sessionId = findOrCreateSession(sender);

                        // We retrieve the message content
                        var {
		            text,
                            attachments
		          } = event.message;
                        //console.log(event.message);
                        if (attachments) {
                            // We received an attachment
                            // Let's reply with an automatic message
                            fbMessage(sender, 'Bạn đáng yêu quá trời. Hihi')
                                .catch(console.error);
                        } else if (text) {

                            // var split=text.split(" ");

                            // var keyword;
                            // for(var i=0;i<split.length;i++)
                            // {
                            // 	keyword+=split[i]+"%20";
                            // }
                            if (text.includes("@"))
                                text = text.replace("@", " ");
                            text = text.trim();
                            var sever = severRasaQuery + text;
                            var url = encodeURI(sever);

                            var button_payload_state = 0;//không có gì, 1: hoi sp, 2: hỏi giá, 3: hỏi trả góp


                            getJsonAndAnalyze(url, sender, sessionId, button_payload_state);




                        }
                    }
                    else if (event.postback)//xử lý postback
                    {

                        const sender = event.sender.id;


                        // We retrieve the user's current session, or create one if it doesn't exist
                        // This is needed for our bot to figure out the conversation history
                        const sessionId = findOrCreateSession(sender);

                        var button_payload_state = 0;//không có gì, 1: hoi sp, 2: hỏi giá, 3: hỏi trả góp
                        var postbackTitle = "";

                        //console.log(event.postback);
                        if (event.postback && event.postback.payload) {
                            button_payload_state = event.postback.payload;
                            postbackTitle = event.postback.title;

                        }

                        if (button_payload_state === "1" || button_payload_state === "2" || button_payload_state === "3")//greet
                        {

                            responsepostbackgreet(sender, sessionId, button_payload_state);
                        }
                        else {//quận/huyện select hoặc select color


                            if (button_payload_state.length >= 10)//nếu ID lớn hơn 10 chữ số (vì nó là productCode)
                            {


                                var productCode = button_payload_state;

                                responsepostbackcolor(sender, sessionId, productCode, postbackTitle);

                            }
                            else if (button_payload_state === "BAD" || button_payload_state === "GOOD" || button_payload_state === "NORMAL") {
                                var feedback = button_payload_state;
                                responsepostbackFeedback(sender, sessionId, feedback);
                            }
                            else {


                                var districID = parseInt(button_payload_state);

                                responsepostbackdistric(sender, sessionId, districID);

                            }
                        }



                    }

                });
            });
        }

        res.sendStatus(200);

    },
};

module.exports = webhookController;

