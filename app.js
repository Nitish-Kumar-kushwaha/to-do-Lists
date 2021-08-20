const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


mongoose.connect('mongodb://localhost:27017/todolistDB',{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// to-dolist

const itemsSchema = mongoose.Schema({
    name : String
});

const Item = mongoose.model("Item", itemsSchema);


// list Schema

const listSchema = mongoose.Schema({
    name : String,
    items : [itemsSchema]
});

const List = mongoose.model("List", listSchema);



const item1 = new Item({
    name : "reading books"
});

const item2 = new Item({
    name : "Coding"
});

const itme3 = new Item({
    name : "Reading books"
});

const defualtItems = [];




let post = [];
let workPost = [];

app.set('view engine', 'ejs');

app.get('/' , (req, res)=>{

    Item.find({}, (err, foundItems)=> {

        if(foundItems.length === 0){
            Item.insertMany(defualtItems, (err)=> {
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Sucessfully saved defualt items in to DB");
                }
            });
            res.redirect('/');

        }
        else{
            res.render('index' , {name:"to do list", Post : foundItems});
        }
        
    })
    
});

app.post('/', (req, res)=>{
    let itemName = req.body.newItem;
    let listName = req.body.list;
    // if(itemName === ''){
    //     console.log("null value added");
    //     // alert('null value cant be added');
        
    //     res.redirect('/');
    // }
    // else{
        const item = new Item({
            name : itemName
        });

        if(listName === "to do list"){
            item.save();
            res.redirect('/');
        }
        else{
            List.findOne({name: listName}, (err, foundList)=> {
                console.log(err);
                foundList.items.push(item);
                foundList.save();
                res.redirect('/'+ listName);
            });
        }
    // }
});

app.post('/delete', (req, res)=> {

    const checkedItemIDs = req.body.checkbox;
    const listName = req.body.listName;
    console.log(listName);
    console.log(checkedItemIDs);

    if(listName === 'to do list'){
        Item.findByIdAndRemove(checkedItemIDs, (err)=> {
            if(err){
                console.log("not deleted");
                console.log(err);
                res.redirect('/');
            }
            else{
                console.log("sucefully deleted");
                res.redirect('/');
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemIDs}}}, (err, foundList)=> {
            if(!err){
                res.redirect('/'+listName);
            }
        } );
    }
    
});

app.get('/:customListName' , (req , res)=>{

    let itemName = req.body.newItem;
    let customListName = req.params.customListName;
    
    List.findOne({name : customListName}, (err, foundList)=> {
        if(!err){
            if(!foundList){
                const listItems = new List({
                    name : customListName,
                    items : defualtItems
                });
                listItems.save();
                res.redirect('/'+ customListName);
            }
            else{
                res.render("index", {name:foundList.name, Post : foundList.items});
            }
        }
    })

});

// app.post('/work', (req, res)=> {

//     var item = req.body.newItem;
//     workPost.push(item);
//     res.redirect('/work');

//     // console.log(post.length);

// })



app.listen(3000, ()=>{
    console.log('port 3000  is running');
});