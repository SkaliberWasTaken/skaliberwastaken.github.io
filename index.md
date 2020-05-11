<html>
<head>
    <title>Modular Caelesti</title>
    <style>
        body {
            background-color: darkgray;
        }

        #background {
            overflow: hidden;
            margin-left: 25%;
            padding-left: 2%;
            padding-right:2%;
            width: 46%;
            height: 110%;
            background-color: dimgray;
        }
        .option{
            width:100%;
            height:10%;
            background-color:darkslategray;
            border-radius:15px;
            position:relative;
        }
        /*toggle button*/
        .toggle-wrap {
            position: relative;
            background-color: black;
            display: inline-block;
            margin-left: 85%;
            margin-top: 5%;
            cursor: pointer;
            width: 10%;
            height: 10%;
            border-radius: 25px;
        }
        /*hide the checkbox*/
        .toggle-wrap input{
            width:0;
            height:0;
            opacity:0;
        }
        /*actual bar, with anim*/
        .toggle {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 10%;
            height: 100%;
            background-color: #FFAE00;
            border-radius: 25px;
            -webkit-transition: width .4s;
            transition: width .4s;
            transition-timing-function: ease-in-out;
            -webkit-transition-timing-function: ease-in-out;
        }
        /*what happens on press*/
        input:checked + .toggle{
            width: 100%;
        }
    </style>
</head>
<body>
    <div id="background">
        <h1>Modular Caelesti options</h1>
        <div class="option">
            <label class="toggle-wrap">
                <input type="checkbox" style="display:none"/> 
                <span class="toggle"></span>
            </label>
        </div>
    </div>
</body>
</html>
