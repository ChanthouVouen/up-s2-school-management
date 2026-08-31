import RegisterContainer from "./_register-container"


export default function RegisterPage () {
    return (
        <div className="flex min-h-screen w-full flex-col overflow-hidden lg:flex-row">
            <div className="left-container flex w-full items-center justify-center bg-white px-4 py-6 sm:px-6 lg:w-[40%] lg:px-0 lg:py-0">
                <RegisterContainer />
            </div>
            <div className="right-container hidden lg:block h-[240px] w-full bg-red-300 sm:h-[300px] lg:h-screen lg:w-[60%]">
                <img src="/images/up-image.png" alt="University of Puthisastra" className="h-full w-full object-cover" />
            </div>
        </div>
    )
}