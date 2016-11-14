//to kill the boss you need:
//-poison
//-magic sword
//-at least 15th level
//100% health

import React, { Component } from 'react';


var App  =  React.createClass({
    getInitalState(){           
        return {}; 
    },

    componentDidMount(){         
        document.addEventListener('keydown', this.handleKeyDown, false);        
        this.resetGame();
    },

    componentWillUnmount: function() {
        document.removeEventListener('keydown', this.handleKeyDown);
    },
    //reset all the game configs to initail 
    resetGame(){
        var canvas = document.getElementById("canvas");     
        var ctx = canvas.getContext("2d"); 
        //drawing borders   
        ctx.fillStyle="#777";
        ctx.fillRect(0,0,2800,2800);
        //the game board
        ctx.fillStyle="#eee";
        ctx.fillRect(150,150,2500,2500);        
        //drawing walls and paths
        //this array stores data that represents the gameboard
        var board = this.generateBoard(ctx);     
        //helper function that creates Image object
        var createImage = function(src){
            var img = new Image();
            img.src = src;
            return img;
        }   
        //array of images
        var images = {
            "hero-right": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/hero-right.png"),
            "hero-left": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/hero-left.png"),
            "treasure": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/treasure.png"),
            "boss": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/boss.png"),
            "key": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/key.png"),
            "monster1": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/monster1.png"),
            "monster2": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/monster2.png"),
            "monster3": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/monster3.png"),
            "axe": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/axe.png"),
            "mace": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/mace.png"),
            "poison": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/poison.png"),
            "sword": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/sword.png"),
            "medicine": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/medicine.png"),
            "axeleft": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/axeleft.png"),
            "axeright": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/axeright.png"),
            "maceleft": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/maceleft.png"),
            "maceright": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/maceright.png"),
            "swordleft": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/swordleft.png"),
            "swordright": createImage("http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/swordright.png")
        };                
        var imageCount = Object.keys(images).length;        
        var imagesLoaded = 0;
        //when all the images loaded - start the game
        for(var key in images){            
            images[key].onload = function(){
                imagesLoaded++;                
                if(imagesLoaded == imageCount){                    
                    startGame();
                }
            };
        }
        //setting initial state
        var startGame = function(){          
            this.setState({
                    //values: "victory" and "defeat"
                    //if null - play the game. Not null - stop the game
                    gamestatus: null,                    
                    ctx: ctx,
                    board: board,                    
                    hero:{
                        //to kill the boss - must collect poison
                        hasPoison:false,
                        //to open the treasure storage - need a key
                        keysCollected:0,                        
                        health:100,
                        //depends on what weapon carries.
                        //default - fist
                        attack:2,
                        //Expirience. To get xp need damage an enemy.
                        xp:0,
                        //level=Math.floor(sqrt(xp))
                        level:1,
                        weapon: "Fist",
                        //what to show if you press right arrow key
                        imgright:images["hero-right"],
                        //what to show if you press left arrow key
                        imgleft:images["hero-left"],
                        ////what to show if you press up/down arrow key
                        img: images["hero-right"],
                        //coordinates
                        x: 0,
                        y:0
                    },
                    boss:{                        
                        health:265,
                        attack:150,                        
                        img:images["boss"]
                    },
                    treasures: {
                        img: images["treasure"],
                        items: []
                    },
                    keys:{
                        img: images["key"],
                        items: []  
                    },
                    monsters1: {
                        attack:10,
                        img: images["monster1"],
                        items: []
                    },
                    monsters2: {
                        attack:20,
                        img: images["monster2"],
                        items: []
                    },
                    monsters3: {
                        attack:25,
                        img: images["monster3"],
                        items: []
                    },
                    axes:{
                        damage:5,
                        imgleft: images["axeleft"],
                        imgright: images["axeright"],
                        img: images["axe"],
                        items: []
                    },
                    medicines:{
                        img: images["medicine"],
                        items: []  
                    },
                    maces:{
                        damage:15,
                        imgleft: images["maceleft"],
                        imgright: images["maceright"],
                        img: images["mace"],
                        items: []
                    },
                    poison:{
                        img: images["poison"],
                        items: []
                    },
                    sword:{
                        //magic sword with super damage points
                        damage:250,
                        imgleft: images["swordleft"],
                        imgright: images["swordright"],
                        img: images["sword"],
                        items: []
                    }
                },
                ()=>{this.placeItems();}
            );
        }.bind(this)          
        
    },

    //place all the game items on the board
    placeItems(){                
        var board = this.state.board;
        this.placeHero();                

        //place the boss
        var boss = this.state.boss;                
        var bossCoords = this.findHiddenCell(1);
        boss.x = bossCoords.x;
        boss.y = bossCoords.y;                
        board[boss.x][boss.y]=6;
        this.state.ctx.drawImage(boss.img,boss.x*50+150,boss.y*50+150,50,50);         

        //place the treasures
        var treasures = this. state.treasures;
        for(var i=0; i<2; i++){
            var coords = this.findHiddenCell(1);
            var item = {
                x: coords.x,
                y: coords.y,
                content: !i?"poison":"hammer"
            };
            treasures.items.push(item);
            board[coords.x][coords.y]=8;
            this.state.ctx.drawImage(treasures.img,coords.x*50+150,coords.y*50+150,50,50);         
        }        

        //place keys
        var keys = this.state.keys;
        for(var i=0; i<2; i++){
            var coords = this.findHiddenCell(2);
            var item = {
                x: coords.x,
                y: coords.y                
            };
            keys.items.push(item);
            board[coords.x][coords.y]=9;
            this.state.ctx.drawImage(keys.img,coords.x*50+150,coords.y*50+150,50,50);         
        }        

        //place regular characters(enemies)
        var monsters1 = this.state.monsters1;
        for(var i=0; i<30; i++){
            var coords = this.getRandomCell();
            var item = {
                health:20,
                x: coords.x,
                y: coords.y                
            };
            monsters1.items.push(item);
            board[coords.x][coords.y]=3;
            this.state.ctx.drawImage(monsters1.img,coords.x*50+150,coords.y*50+150,50,50);         
        }

        var monsters2 = this.state.monsters2;
        for(var i=0; i<10; i++){
            var coords = this.getRandomCell();
            var item = {
                health:40,
                x: coords.x,
                y: coords.y                
            };
            monsters2.items.push(item);
            board[coords.x][coords.y]=4;
            this.state.ctx.drawImage(monsters2.img,coords.x*50+150,coords.y*50+150,50,50);         
        }

        var monsters3 = this.state.monsters3;
        for(var i=0; i<5; i++){
            var coords = this.getRandomCell();
            var item = {
                health:60,
                x: coords.x,
                y: coords.y                
            };
            monsters3.items.push(item);
            board[coords.x][coords.y]=5;
            this.state.ctx.drawImage(monsters3.img,coords.x*50+150,coords.y*50+150,50,50);         
        }

        var axes = this.state.axes;
        for(var i=0; i<4; i++){
            var coords = this.getRandomCell();
            var item = {
                x: coords.x,
                y: coords.y                
            };
            axes.items.push(item);
            board[coords.x][coords.y]=10;
            this.state.ctx.drawImage(axes.img,coords.x*50+150,coords.y*50+150,50,50);         
        }


        var maces = this.state.maces;
        for(var i=0; i<2; i++){
            var coords = this.getRandomCell();
            var item = {
                x: coords.x,
                y: coords.y                
            };
            maces.items.push(item);
            board[coords.x][coords.y]=11;
            this.state.ctx.drawImage(maces.img,coords.x*50+150,coords.y*50+150,50,50);         
        }

        var medicines = this.state.medicines;
        for(var i=0; i<12; i++){
            var coords = this.getRandomCell();
            var item = {
                x: coords.x,
                y: coords.y                
            };
            medicines.items.push(item);
            board[coords.x][coords.y]=12;
            this.state.ctx.drawImage(medicines.img,coords.x*50+150,coords.y*50+150,50,50);         
        }


        this.setState({
            board: board,
            boss: boss,
            treasures: treasures,
            keys: keys,
            monsters1: monsters1,
            monsters2: monsters2,
            monsters3: monsters3,
            axes: axes,
            maces: maces,
            medicines: medicines            
        });
    },

    //looking for the cell that is hard to get to
    findHiddenCell(limit){
        var board = this.state.board;
        while(true){                        
            for(var x=Math.floor(Math.random()*50); x < 50; x++){
                for (var y=Math.floor(Math.random()*50); y < 50; y++){                
                    //we found 'empty' cell(value of 2 means - it's floor)
                    if(board[x][y]==2){
                        var nbs = this.countAliveNeighbours(board, x, y);
                        //we found a cell that surrounded by walls, but only 'limit' neighbour cell are floor
                        if(nbs==limit){                            
                            return {x: x, y: y};
                        }
                    }
                }
            }
        }   
    },

    //getting a random empty cell
    getRandomCell(){
        while(true){
            var x=Math.floor(Math.random()*50);
            var y=Math.floor(Math.random()*50);
            if(this.state.board[x][y]==2)
                return {x:x, y:y};
        }
    },

    //generate game board
    generateBoard(ctx){
        //getting an array filled with 0 and 1
        var board=this.initBoard();                    

        //applying cellular automation to create a game board
        //value of 2 is optimal for the game
        for(var i=0;i<2;i++)
            board = this.getNextGeneration(board);                   

        //removing unaccessible parts
        board = this.fixBoard(board);                
        var img = new Image();
        img.src = 'http://res.cloudinary.com/dzjiv8sye/image/upload/v1475295576/wall.png';
        //draw the game board
        img.onload=function(){
            for(var x=0; x<50; x++){                       
                for(var y=0; y<50; y++){
                    if(board[x][y]==0){                        
                        //walls
                        board[x][y]=0;                        
                        ctx.drawImage(img,x*50+150,y*50+150,50,50);
                    }                    
                }
            }

        }                
        return board;
    },

     //initializing board array - fill it randomly with 0 and 1
    initBoard(){
        var board = new Array(50);
        for(var x=0; x<50; x++){
            board[x]=new Array(50);
            for(var y=0; y<50; y++){               
                //value 0.45 - is good for cave 'shape'
                board[x][y]=Math.random()<0.45?1:0;    
            }
        }
        return board;
    },


    //in here we reassign our board array with the rules:
    //look at the 8 neighbours: the neighbour with value 1 or 2 - is alive else - is dead
    // - if the cell is alive and has < 4 alive neighbours  - the cell dies.
    // - if the cell is dead and has > 3 alive neighbours - the cell becomes alive.
    getNextGeneration(board){
        //in here we store next generation board
        var nextBoard=[];
        for (var i = 0; i < 50; i++)
            nextBoard.push(board[i].slice(0)); 
        
        for(var i=0; i<50; i++){
          for(var j=0; j<50; j++){            

            var count=this.countAliveNeighbours(board, i, j);
           
            //the cell is alive        
            if(board[i][j]){                
                if(count<4)
                    //the cell dies
                    nextBoard[i][j]=0;
                else 
                    //the cell alive
                    nextBoard[i][j]=1;
            } 
            //dead cell       
            else{
                if(count>3)
                    //now it's alive
                    nextBoard[i][j]=1;
                else
                    //dead cell
                    nextBoard[i][j]=0;
            }                  
          }
        }           
        return nextBoard;
    },

    //analize neighbour cells
    countAliveNeighbours(board, i, j){    
        var count=0;        

        for(var m=i-1; m<=i+1; m++){
          for(var n=j-1; n<=j+1; n++){
            if(m===i&&n===j){                  
              continue;
            }

            var row=m;
            var col=n;
            //we looking out of the array's bounds
            if(m>=board.length||m<0)
              continue;
            //we looking out of the array's bounds
            else if(n>=board[0].length||n<0)
              continue;

            else if(board[row][col]>0){                                    
              count++;              
            }
          }
        }
        return count;
    },

    //flooding the array and remove all isolated areas
    floodFill(boardParam,x, y){       
        var board = new Array(50);
        for(var i=0; i<50; i++){
            board[i]=boardParam[i].slice(0);
        }

        var width = 50;
        var height = 50;
        var stack = [[x, y]];
        var cell;
        var point = 0;        
        
        while (stack.length > 0)
        {   
            cell = stack.pop();
            var x=cell[0];
            var y=cell[1];
            //index out of bound
            if (x < 0 || x >= width)
                continue;
            if (y < 0 || y >= height)
                continue; 

            if(!board[x][y]||board[x][y]==2)
                continue;                           
            else{                     
                // painting
                board[x][y] = 2;
                    
                // putting the neighbours in the stack to check them
                stack.push([
                    x - 1,
                    y
                ]);
                stack.push([
                    x + 1,
                    y
                ]);
                stack.push([
                    x,
                    y - 1
                ]);
                stack.push([
                    x,
                    y + 1
                ]);             
            }
        }       
        return board;
    },

    fixBoard(board){        
        //making a line in the middle of the board
        //so the flood fill will work properly
        for(var i=0; i<50; i++)    
            board[25][i]=1;        

        //filling the "floor" with 2
        board = this.floodFill(board, 25, 0);

        //setting all the isolated areas to 0.
        for(var x=0; x<50; x++){
            for(var y=0; y<50; y++){            
                if(board[x][y]!=2)
                    board[x][y]=0;
            }
        }         

        return board;        
    },
    placeHero(){                
        var board = this.state.board;        
        for(var x=0; x < 50; x++){
            for (var y=0; y < 50; y++){                
                if(board[x][y]==2){ 
                    var img = this.state.hero.img;
                    this.state.ctx.drawImage(img,x*50+150,y*50+150,50,50);         
                    board[x][y]=7;
                    var hero = this.state.hero;
                    hero.x = x;
                    hero.y = y;
                    this.setState({
                        hero: hero,
                        board: board
                    });            
                    this.scrollWrapper(x*50, y*50);            
                    return;          
                }
            }
        }       
    },        
    scrollWrapper(x, y){
        var wrapper = document.getElementById('container');  
        wrapper.scrollTop = y;
        wrapper.scrollLeft = x;
    },
    endGame(message){        
        if(message=="victory")
            this.setState({gamestatus:"victory"});
        else
            this.setState({gamestatus:"defeat"});
    },
    attack(x,y){
        var hero=this.state.hero;
        var board = this.state.board;        
        var enemies = null;
        var monsterAttack=0;
        switch(board[x][y]){
            //monster1
            case 3:
                enemies = this.state.monsters1.items;  
                monsterAttack = this.state.monsters1.attack;
                break;
            case 4:
            //monster2
                enemies = this.state.monsters2.items;  
                monsterAttack = this.state.monsters2.attack;
                break;
            case 5:
            //monster3
                enemies = this.state.monsters3.items;
                monsterAttack = this.state.monsters3.attack;  
                break;        
        }                              
        //index - index of the monsters.items array element with these x,y
        var index=0;
        for(var i=0; i<enemies.length; i++){
            if(enemies[i].x==x&&enemies[i].y==y){
                //we got the index
                index=i;                        
                break;
            }
        }                 
        //the hero attacks
        var damage=hero.attack+hero.level;                
        enemies[index].health-=damage;
        
        //the enemy attacks
        hero.health-=monsterAttack;
        if(hero.health<=0){
            //the hero dies
            this.endGame("defeat");
        }
        
        //hero survives
        //get 1 xp                       
        hero.xp+=Math.floor(damage/3);
        //level up
        if(hero.xp>=(hero.level+1)*(hero.level+1)){
            hero.level++;                        
        }
        //enemy survies
        if(enemies[index].health>0){
            x=hero.x;
            y=hero.y;                    
        }
        //enemy dies
        else{
           board[x][y]=2;
           enemies.splice(index, 1);
        }                        
    
        this.setState({
            board: board,
            hero:hero
        });
        return {x: x, y:y};
    },  
    attackTheBoss(x,y){
        var hero=this.state.hero;
        var board = this.state.board;        
        var boss = this.state.boss;        
        if(hero.hasPoison){
            boss.attack=90;
        }        
        //the hero attacks
        var damage=hero.attack+hero.level;                
        boss.health-=damage;
        
        //the enemy attacks
        hero.health-=boss.attack;
        if(hero.health<=0){
            //the hero dies
            this.endGame("defeat");
        }
        
        //hero survives
        //get 1 xp                       
        hero.xp+=Math.floor(damage/3);
        //level up
        if(hero.xp>=(hero.level+1)*(hero.level+1)){
            hero.level++;                        
        }
        //enemy survies
        if(boss.health>0){
            x=hero.x;
            y=hero.y;                    
        }
        //enemy dies
        else{
           this.endGame("victory")
        }                        
    
        this.setState({
            board: board,
            hero:hero,
            boss:boss
        });
        return {x: x, y:y};
    },
      
    handleKeyDown(e){                                
        var x=this.state.hero.x;
        var y=this.state.hero.y;           
        var board = this.state.board;
        var hero = this.state.hero;
        var treasures = this.state.treasures;
        var ctx = this.state.ctx;
        var img = this.state.hero.img;
        switch(e.keyCode){            
            case 37:       
                img = this.state.hero.imgleft;                 
                if(x>0&&board[x-1][y]!==0)
                    x--;                                                        
                e.preventDefault();
                break;
            case 38:                        
                if(y>0&&board[x][y-1]!==0)                
                    y--;
                e.preventDefault();                
                break;
            case 39:
                img = this.state.hero.imgright;
                if(x+1<50&&board[x+1][y]!==0)
                    x++;
                e.preventDefault();
                break;
            case 40:
                if(y+1<50&&board[x][y+1]!==0)
                    y++;                
                e.preventDefault();
                break;
            default:
                return;
        }

        switch(board[x][y]){
            case 1:
                //it's just a wall
                break;
            case 2:
                //it's a floor so no problem
                break;    
            case 3:                
            case 4:
            case 5:
                //monster1               
                var temp = this.attack(x,y); 
                x=temp.x;
                y=temp.y;
                                
                break;                                    
            case 6:
                //the boss
                var temp = this.attackTheBoss(x,y); 
                x=temp.x;
                y=temp.y;
                break;    
            case 7:
                //the hero
                break;    
            case 8:
                //treasure
                if(!hero.keysCollected){
                    //no key
                    x=hero.x;
                    y=hero.y;    
                }
                else{
                    //get the treasure
                    hero.keysCollected--;
                    if(treasures.items[0].content=="poison"){
                        //give poison
                        hero.hasPoison = true;                            
                    }
                    else{
                        //give the magic sword
                        hero.imgleft=this.state.sword.imgleft;
                        hero.imgright=this.state.sword.imgright;
                        img = this.state.sword.imgright;
                        hero.attack=this.state.sword.damage;
                        hero.weapon="Magic Sword"                        
                    }   

                    treasures.items.splice(0, 1);
                }
                
                break;                
            case 9:            
                //a key
                hero.keysCollected++;
                break;    
            case 10:
                //axe
                hero.imgleft=this.state.axes.imgleft;
                hero.imgright=this.state.axes.imgright;
                hero.attack=5;
                hero.weapon="Axe";
                img = this.state.axes.imgright;
                break;            
            case 11:
                //mace
                hero.imgleft=this.state.maces.imgleft;
                hero.imgright=this.state.maces.imgright;
                hero.attack=15;
                hero.weapon="Mace";
                img = this.state.maces.imgright;
                break;    
            case 12:
                //medicine                            
                var temp = hero.health+50
                hero.health=temp<=100?temp:100;                                
                break;            
        }

        
        ctx.fillStyle="#eee";                                  
        ctx.fillRect (hero.x*50+150, hero.y*50+150, 50, 50);                                  
        board[hero.x][hero.y]=2;                        
        ctx.drawImage(img,x*50+150,y*50+150,50,50);             
        board[x][y]=7;         
        hero.img=img;
        hero.x=x;
        hero.y=y;
        this.setState({
            hero:hero,
            board: board,
            treasures: treasures,
        },()=>{this.scrollWrapper(this.state.hero.x*50,this.state.hero.y*50);});                        
                    
    },

    render() {                
        var health=100;
        var xp=0;
        var level=1;        
        var weapon="Fist";
        var gamestatus = null;
        if(this.state){            
            var hero = this.state.hero;
            health = hero.health>=0?hero.health:0;
            xp=hero.xp;
            level=hero.level;            
            weapon=hero.weapon;
            gamestatus = this.state.gamestatus;
        }
        return(                          
            <div>
                <Dialog gamestatus={gamestatus} onClick={this.handleClick}/>
                <Info 
                    health={health}
                    xp={xp}
                    level={level}                    
                    weapon={weapon}
                />
                <div id="container">                     
                    <canvas id="canvas" width="2800" height="2800" ></canvas>   
                </div>            
            </div>    
        );       
        
        
    },
    handleClick(e){
        //restart the game
        this.resetGame();
    }
}); 
var Dialog=React.createClass({
    render(){                
        return(
            <div className={!this.props.gamestatus&&"hidden"} id="dialog">
                You {this.props.gamestatus=="defeat"?"lose":"won"}                
                <div className="section btn" onClick={this.props.onClick}>
                  <div className="corner tl">
                    <div className="a"></div>
                    <div className="b"></div>
                    <div className="c"></div>
                  </div>
                  <div className="corner tr">
                    <div className="a"></div>
                    <div className="b"></div>
                    <div className="c"></div>
                  </div>
                      
                  <div className="section_content">
                    Play again
                  </div>
                      
                  <div className="corner bl">
                    <div className="a"></div>
                    <div className="c"></div>
                    <div className="b"></div>
                  </div>
                  <div className="corner br">
                    <div className="a"></div>
                    <div className="c"></div>
                    <div className="b"></div>
                  </div>
                </div>
            </div>
        );
    }
});

var Info = React.createClass({
    render(){
        var hpStyle = {
          width: this.props.health+"%"
        };

        return(
            <div id="info">
                <div>
                    <div id="hpcontainer">
                        <div id="hpbar" style={hpStyle}>
                            <div id="hp">
                                HP:{this.props.health}
                            </div>
                        </div>    
                    </div>                    
                    <div>XP:{this.props.xp}</div>
                </div>
                <div>    
                    <div>LEVEL:{this.props.level}</div>                
                    <div>WEAPON:{this.props.weapon}</div>                
                </div>                       
            </div>
        );
    }
});

export default App;