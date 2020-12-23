const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const date = require(__dirname + '/date.js');

const app = express();
app.use(express.static('public'));
app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useUnifiedTopology:true , useNewUrlParser:true});
const itemsSchema = {
    name : String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
    name : "Welcome to your todolist"
});

const item2 = new Item({
    name : "Hit + button to add new items"
});

const item3 = new Item({
    name :"<--Hit this to delete an item"
});

const defaultItems = [item1 , item2 , item3];

const listSchema = {
    name : String,
    items: [itemsSchema]
};

const List = mongoose.model("List" , listSchema);


app.get('/' , function(req , res){

    Item.find({} , function(err , results){
        
        if(results.length === 0)
        {
            Item.insertMany(defaultItems , function(err) {
            if(err){
                console.log(err);
            }else{
                 console.log("Succes saved default items to DB");
                }
            });
            res.redirect('/');
        }
        else
        {
            let day = date.getDate();
            res.render("list" , {listTitle :"Today" , newListItem : results});
        }

    });

});

app.get("/:customListName" , function(req , res){
    const customListName = req.params.customListName;

    List.findOne({name : customListName } , function(err , foundList){
        
        if(!err){
            if (!foundList){
                //Create new list
                const list = new List({
                    name : customListName,
                    items : defaultItems
                });
            
                list.save();
                res.redirect('/' + customListName);
            }else{
                //show existing list
                res.render('list' , {listTitle : foundList.name , newListItem : foundList.items});
            }
        }
    });

    
});

app.post("/" , function(req , res){
    
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({
        name : itemName
    });

    if(listName == "Today"){
        newItem.save();
        res.redirect("/");
    }else{
        List.findOne({name : listName}, function(err ,foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect('/' + listName);
        });
    }

    
});

app.post("/delete" , function(req , res){
    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId , function(err){
        if(!err)
        {
            console.log("Successfuly deleted item");
            res.redirect("/");
        }
    });
});

app.listen(3000 , function(){
    console.log("Server is up and running");
});