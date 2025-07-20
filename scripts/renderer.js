const loginBtn = document.getElementById('loginBtn');
const message = document.getElementById('message');

loginBtn.addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await window.electronAPI.login({ username, password });

  if (response.success) {
    message.innerText = 'Login Successful 🎉';
    message.style.color = 'green';
    window.location.href = "../views/data_entry.html";

  } else {
    message.innerText = 'Login Failed ❌';
    message.style.color = 'red';
  }
});
