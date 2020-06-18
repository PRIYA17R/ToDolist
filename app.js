//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require ("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/toDOListDB", {useNewUrlParser :true});
const itemSchema = {name : String};

const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({name : "welcome to your 46 list"});
const item2 = new Item({name : "Hit the + to add item"});
const item3 = new Item({name : " Hit the - to delete the item"});
const defaultItem = [item1, item2, item3];

//list for miltiple task
const listSchema = {
  name : String,
  items : [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0 )
    {
      Item.insertMany(defaultItem,function(err){
        if(err)
        console.log(err); 
        else 
        console.log("Successfully added default in the list"); 
    });
    res.redirect("/");
    }
    else
    res.render("list", {listTitle: "Today", newListItems: foundItems}); 
  });
});

app.get("/:customListName", function(req,res){
const customListName = _.capitalize(req.params.customListName);
List.findOne({name : customListName}, function(err,foundList){
  if(!err){
      if(!foundList){
        //create new list
        const list = new List({
          name : customListName,
          items :defaultItem
        });
        
        list.save();
        res.redirect("/"+ customListName);
    }
    else{
     //show existing list 
     res.render("list", {listTitle:customListName , newListItems:foundList.items});
    }
  }
})
});

  app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item ({ name : itemName});
      if(listName ==="Today"){
        item.save();
        res.redirect("/");
      }
      else{
        List.findOne({name:listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName);
        });
      
      }
  });

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
 if(listName ==="Today"){
  Item.findByIdAndDelete(checkedItemId, function(err){
    if(!err){
      console.log("Successfully deleted checked item from the list"); 
      res.redirect("/");
    }
   
  });
 }else{
//List.findOneAndUpdate(condition,update,callback)
List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err, foundList){
  if(!err){
    console.log("Successfully deleted checked item from "+listName+" the list"); 
    res.redirect("/"+listName);
  }
});
}

  
});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
