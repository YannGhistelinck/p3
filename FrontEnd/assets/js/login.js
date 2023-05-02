
async function initForm() {

    const login = document.querySelector("#loginForm");
    login.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = login.emailLogin.value;
        const pwd = login.passwordLogin.value;
        const body = {
            "email": email,
            "password": pwd
        }
        const testLogin = await sendLoginInfo(body)
        if(testLogin.userId){
            window.localStorage.setItem("token", testLogin.token);
            window.location.href = "../index.html"
        }else{
            document.querySelector("#incorrectPassword").innerHTML = "Email ou mot de passe incorrect..."
        }
    })
}
initForm()

async function sendLoginInfo(data) {
    const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    if (response.ok) {
        return response.json()
    } else {
        console.log(response);
        return response.status
    }
};
