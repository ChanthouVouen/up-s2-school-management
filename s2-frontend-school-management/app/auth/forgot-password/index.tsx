import { FormField, PrimaryButton, FormHeader } from '../common/form';

export default function ForgotPassword() {

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full justify-center overflow-hidden">
            <div className="left-container flex lg:w-[40%] items-center justify-center bg-white py-6 px-4 lg:py-0 lg:px-0">
                <div className="w-full h-auto max-w-xl px-1 sm:w-[90%] lg:w-[80%]">
                    <FormHeader
                        title="Forgot Password"
                        subtitle=""
                    />
                    <div className="w-full">
                        <form action="#" method="POST" className="space-y-5 sm:space-y-6">
                            <FormField
                                id="email"
                                label="Email address"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                            />


                            <div className="pt-2">
                                <PrimaryButton>Send</PrimaryButton>
                            </div>

                            <p className="text-center text-gray-600">Back to <a href="/login" className="text-blue-400 underline">login</a></p>
                        </form>
                    </div>
                </div>
            </div>
            <div className="right-container h-screen w-[60%] bg-red-300 hidden lg:block ">
                <img src="/images/up-image.png" alt="University of Puthisastra" className="h-full w-full object-cover" />
            </div>
        </div>
    )
}