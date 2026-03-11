<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DYNAMIS Login</title>
  <link rel="stylesheet" href="cloudhealth.css">
  <style>
    body {
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
      background:#0f172a;
    }
    .login-box {
      background:white;
      padding:40px;
      width:350px;
      border-radius:8px;
      text-align:center;
    }
    input {
      width:100%;
      padding:10px;
      margin-top:10px;
    }
  </style>
</head>
<body>

<div class="login-box">
  <h2>DYNAMIS</h2>
  <p>Login</p>

  <input type="email" id="email" placeholder="Email">
  <input type="password" id="password" placeholder="Password">

  <button class="ch-btn" style="margin-top:15px;" onclick="login()">Login</button>

  <div id="error" style="color:red; margin-top:10px;"></div>
</div>

<script>

async function login(){

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:3001/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if(!res.ok){
    document.getElementById("error").textContent = data.error || "Login failed";
    return;
  }

  localStorage.setItem("dynamis_token", data.token);

  window.location.href = "index.html";
}

</script>

</body>
</html>