import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CallToActionSection() {

    return (
        <section className="flex justify-center mt-24 px-4 md:px-0">
            <section className="py-12 md:py-20 px-6 md:px-8 lg:px-16 bg-gradient-to-r from-purple-700 to-purple-500 text-primary-foreground rounded-xl text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-semibold mb-6 leading-tight">
                        Ready to Hear From Your Audience?
                    </h2>
                    <p className="text-lg mb-10 text-primary-foreground">
                        Create your first poll in less than 60 seconds. No credit card or complex setup required. 
                        <span className="inline-block">Launch a poll today and watch the responses roll in live.</span>
                    </p>
                    <Link href="/dashboard" passHref>
                        <Button size="lg" className="bg-primary-foreground text-purple-700 hover:bg-primary-foreground/95 hover:text-purple-600 font-semibold text-xl px-10 py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                            Get Started for Free
                        </Button>
                    </Link>
                </div>
            </section>
        </section>
    );
}