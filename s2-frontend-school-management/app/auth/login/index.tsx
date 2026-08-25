import LoginContainer from "./_login-container"
// import upImg from "../../assets/up-image.png";


export default function LoginPage () {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden lg:flex-row">
            <div className="left-container flex lg:w-[40%]  items-center justify-center bg-white px-4 py-6 lg:px-0 lg:py-0">
                <LoginContainer />
            </div>
            <div className="right-container hidden lg:block h-screen w-[60%] bg-red-300">
                <img src="/images/up-image.png" alt="University of Puthisastra" className="h-full w-full object-cover" />
            </div>
        </div>
    )
}