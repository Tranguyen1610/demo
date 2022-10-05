const express = require("express");
const multer = require("multer");
const app = express();

app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

const AWS = require('aws-sdk');
const { request, response } = require("express");
const config = new AWS.Config({
    accessKeyId: 'AKIAVNX73J6GT4CNQXXC',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'BaiBao';

const upload = multer();

app.get('/', (request, response) => {
    const params = {
        TableName: tableName,
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            response.send("Internal Server Error");
        } else {
            return response.render("index", { baiBaos: data.Items });
        }
    });
});
app.post('/', upload.fields([]), (req, res) => {
    const { maBao, tenBB, tenNTG, isbn, soTrang, namXB } = req.body;

    const params = {
        TableName: tableName,
        Item: {
            "maBao": maBao,
            "tenBB": tenBB,
            "tenNTG": tenNTG,
            "isbn": isbn,
            "soTrang": soTrang,
            "namXB": namXB
        }
    }
    docClient.put(params, (err, data) => {
        if (err)
            return res.send('Internal Server Error');
        else
            return res.redirect("/");
    });
});
app.post('/delete', upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);

    if (listItems.length === 0) {
        return res.redirect("/");
    }

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                "maBao": listItems[index],
            }
        }
        docClient.delete(params, (err, data) => {
            if (err)
                return res.send("Internal Server Error");
            else
            if (index > 0)
                onDeleteItem(index - 1);
            else
                return res.redirect("/");
        })
    }
    onDeleteItem(listItems.length - 1);
});
app.get('/addForm',(req,res)=>{
    return res.render('addForm');
});
app.listen(3000, () => { console.log("Server running port 3000") });