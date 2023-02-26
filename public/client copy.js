
/* -------------------------------------------
    Websocket comunication
--------------------------------------------*/
let ws;
function init() {
    if (ws) {
      ws.onerror = ws.onopen = ws.onclose = null;
      ws.close();
    }

    ws = new WebSocket('ws://localhost:8001');
    ws.onopen = () => {
      console.log('Connection opened!');
      add_to_server_log("Connection opened!");
    }
    ws.onmessage = ({ data }) => recieved_message(data);
    ws.onclose = function() {
      ws = null;
    }
}

// send message to server
function send_message(message){
    add_to_server_log("sent data");
    if (!ws) {
        console.log("No WebSocket connection :(");
        return ;
    }
    ws.send(message);
    console.log("sent: " +  message);
}

// is activaded when recieve message from server
function recieved_message(message) {
    add_to_server_log("recievied data");
    if(message[0] == "l"){
        add_to_car_log(message.substring(2));
    }
    else if(message[0] == "m"){
        add_block(message.substring(2));
    }
    else if(message[0] == "r"){
        add_robot(message.substring(2));
    }
    else if(message[0] == "d"){
        add_dot(message.substring(2));
    }
    else if(message[0] == "c"){
        clear_map();
    }
    console.log(message);
}
window.onload = init; // starts the connection on page load

/* -------------------------------------------
    logs
--------------------------------------------*/

var log_msg = []
function add_to_car_log(message){
    log_msg.unshift(message)
    if(log_msg.length>100){
        log_msg.pop()
    }
    let log = document.getElementById("car_log");
    log.innerHTML = log_msg.join("<br>")
}

var server_msg = []
function add_to_server_log(message){
    server_msg.unshift(message)
    if(server_msg.length>100){
        server_msg.pop()
    }
    let log = document.getElementById("server_log");
    log.innerHTML = server_msg.join("<br>")
}

/* -------------------------------------------
    Buttons
--------------------------------------------*/

let multiplier = 1;

let btn1 = document.getElementById("1");
let btn2 = document.getElementById("2");
let btn3 = document.getElementById("3");
let btn4 = document.getElementById("4");
let btn5 = document.getElementById("5");
let btn6 = document.getElementById("6");
let btn7 = document.getElementById("7");
let btn8 = document.getElementById("8");
let btn9 = document.getElementById("9");
let map_scaler = document.getElementById("map_scaler");
let send_variable = document.getElementById("send_variable");

btn1.addEventListener('click', event => {add_to_server_log("pressed button 1");     send_message("b:rotateleft"+multiplier);});   
btn2.addEventListener('click', event => {add_to_server_log("pressed button 1");     send_message("b:forward"+multiplier);});
btn3.addEventListener('click', event => {add_to_server_log("pressed button 2");     send_message("b:rotateright"+multiplier);});
btn4.addEventListener('click', event => {add_to_server_log("pressed button 3");     send_message("b:rotateleft90deg");});
btn5.addEventListener('click', event => {add_to_server_log("pressed button 4");     send_message("b:back"+multiplier);});
btn6.addEventListener('click', event => {add_to_server_log("pressed button 5");     send_message("b:roateright90deg");});
btn7.addEventListener('click', event => {add_to_server_log("pinging server...");    send_message("ping");}); 
btn8.addEventListener('click', event => {add_to_server_log("pressed button 7");     send_message("b:start");}); 
map_scaler.addEventListener('click', event => {add_to_server_log("resized map");    resize_map();}); 
//btn8.addEventListener('click', event => {send_message("m:");});  // not used button
// btn9.addEventListener('click', event => {
//     multiplier += 1;
//     if (multiplier > 3) {
//         multiplier = 1;
//     }
//     add_to_server_log("pressed button 9");
//     btn9.textContent = ("Multiplier " + multiplier + "x");
// });

send_variable.addEventListener('click', event => {
    var tb_array = [];
    tb_array[0] = document.getElementById("tb1").value;
    tb_array[1] = document.getElementById("tb2").value;
    tb_array[2] = document.getElementById("tb3").value;
    tb_array[3] = document.getElementById("tb4").value;
    tb_array[4] = document.getElementById("tb5").value;
    tb_array[5] = document.getElementById("tb6").value;
    for(var i = 0; i < tb_array.length; i++){
        if(tb_array[i] != ""){
            add_to_server_log("sending variable...");
            send_message("v:" + (i+1) + ":" + tb_array[i]);
        }
    }

    
});

/* -------------------------------------------
    Draw map
--------------------------------------------*/

let size = 60;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cell_list = [];
// [[x,y,state,top,right,bottom,left],[x,y,state,top,right,bottom,left],...]

var map_of_blocks = {};
var start_point = [0,0];
var end_point = [1,1]
var robot_cords = [100000,0,0];

function add_block(str){
    block_arr = JSON.parse(str);
    update_end_cords(block_arr);
    draw_block(block_arr[0], block_arr[1], block_arr[2], block_arr[3], block_arr[4], block_arr[5], block_arr[6]);
}

function add_robot(str){
    robot_arr = JSON.parse(str);
    robot_cords = robot_arr;
    redraw_map();
    //draw_robot(robot_cords[0], robot_cords[1], robot_cords[2]);
}

function update_end_cords(block_arr){
    var need_to_redraw_map = false;
    console.log(block_arr);
    key = "[" + block_arr[0] + "," + block_arr[1] + "]";
    map_of_blocks[key] = block_arr.slice(2);

    if(block_arr[0] < start_point[0]){ 
        start_point[0] = block_arr[0]; 
        need_to_redraw_map = true;
    }
    if(block_arr[1] < start_point[1]){ 
        start_point[1] = block_arr[1]; 
        need_to_redraw_map = true;
    }
    if(block_arr[0] > end_point[0]){ 
        end_point[0] = block_arr[1]; 
        need_to_redraw_map = true;
    }
    if(block_arr[1] > end_point[1]){ 
        end_point[1] = block_arr[1]; 
        need_to_redraw_map = true;
    }

    if(need_to_redraw_map){
        redraw_map();
    } 
}

function clear_map(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //cell_list = [];
}

function redraw_map(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for([key, val] of Object.entries(map_of_blocks)){
        cord = JSON.parse(key);
        draw_block(cord[0], cord[1], val[0], val[1], val[2], val[3], val[4]);
        console.log(cord, val);
      }
    if(robot_cords[0] != 100000){
        draw_robot(robot_cords[0], robot_cords[1], robot_cords[2]);
    }
}

function draw_block(x, y, state, up, down, left, right){
    var adjusted_cord = [x - start_point[0], y - start_point[1]];
    var middle=350;
    var dif = [Math.abs(start_point[0]-end_point[0]), Math.abs(start_point[1]-end_point[1])]
    var offset = [middle - dif[0]*size/2, middle - dif[1]*size/2];
 
    var start_pos = [adjusted_cord[0]*size + offset[0], adjusted_cord[1]*size + offset[1]];
    var end_pos = [(adjusted_cord[0]+1)*size + offset[0], (adjusted_cord[1]+1)*size + offset[1]];

    ctx.fillStyle = "#cccccc";
    if(state == 1){ctx.fillStyle = "#ff6666";} // red
    if(state == 2){ctx.fillStyle = "#66ff66";} // green
    ctx.fillRect(start_pos[0], start_pos[1], size, size);

    ctx.lineWidth = Math.floor(size/10);
    ctx.beginPath();
    if(up){ctx.moveTo(start_pos[0], start_pos[1]); ctx.lineTo(end_pos[0], start_pos[1]);}
    if(down){ctx.moveTo(start_pos[0], end_pos[1]); ctx.lineTo(end_pos[0], end_pos[1]);}
    if(left){ctx.moveTo(start_pos[0], start_pos[1]); ctx.lineTo(start_pos[0], end_pos[1]);}
    if(right){ctx.moveTo(end_pos[0], start_pos[1]); ctx.lineTo(end_pos[0], end_pos[1]);}
    ctx.stroke();
}

function resize_map(){
    var preset = [10,20,30,40,50,60,70,80,90,100];
    for(var i = 0; i < preset.length; i++){
        if(size == preset[i]){
            size = preset[(i+1)%preset.length];
            break;
        }
    }
    redraw_map();
    map_scaler.textContent = ("Size: " + size);
}

function draw_robot(x,y,dir){
    x = x/100;
    y = y/100;
    dir = dir/100;
    var adjusted_cord = [x - start_point[0], y - start_point[1]];
    var middle=350;
    var dif = [Math.abs(start_point[0]-end_point[0]), Math.abs(start_point[1]-end_point[1])]
    var offset = [middle - dif[0]*size/2, middle - dif[1]*size/2];
 
    var start_pos = [adjusted_cord[0]*size + offset[0], adjusted_cord[1]*size + offset[1]];
    var end_pos = [(adjusted_cord[0]+1)*size + offset[0], (adjusted_cord[1]+1)*size + offset[1]];

    ctx.beginPath();
    ctx.arc(start_pos[0], start_pos[1], size/6, 0, 2 * Math.PI);
    ctx.fillStyle = "#2596be";
    ctx.fill();
    ctx.stroke();
}

function draw_dot(x,y){
    var adjusted_cord = [x - start_point[0], y - start_point[1]];
    var middle=350;
    var dif = [Math.abs(start_point[0]-end_point[0]), Math.abs(start_point[1]-end_point[1])]
    var offset = [middle - dif[0]*size/2, middle - dif[1]*size/2];
 
    var start_pos = [adjusted_cord[0]*size + offset[0], adjusted_cord[1]*size + offset[1]];

    ctx.beginPath();
    ctx.arc(start_pos[0], start_pos[1], size/30, 0, 2 * Math.PI);
    ctx.fillStyle = "#2596be";
    ctx.fill();
    ctx.stroke();
}

function add_dot(str){
    clear_map();
    dot_arr = JSON.parse(str);
    for(var i = 0; i < dot_arr.length; i++){
        draw_dot(dot_arr[i][0]/40, dot_arr[i][1]/40);
    }

    //redraw_map();
}

add_block("[0,0,1,1,1,1,1]");
add_block("[-2,-5,2,0,1,0,0]");
add_robot("[-150,-450,0]");
//add_dot("[[80,80], [40,40]]");

