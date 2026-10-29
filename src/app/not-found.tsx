import React from 'react'
import { MessageCircle, Monitor, Frown } from "lucide-react";
import Link from 'next/link';

const NotFound = () => {
  return (
    <div className='h-[70vh] flex justify-center items-center'>
        <div className='space-y-12'>
            <div className="lg:max-w-8xl flex items-center gap-3">
              <div className="relative pt-18">
                <Monitor size={84} color="#b619caff" />
                <Frown
                  size={24}
                  className="absolute left-8 bottom-10"
                  color="#86648bff"
                />
              </div>
              <div className="relative flex items-center justify-center pb-6">
                <MessageCircle
                  size={100}
                  fill="#ba1aebff"
                  stroke="#ba1aebff"
                />
                <span className="absolute text-xl text-white">
                  404
                </span>
              </div>
            </div>
            <div>
                <p className='text-4xl font-semibold text-purple-600 mb-6'>Page Not Found</p>
                <p className='mb-1'>
                    The page you requested cannot be found.
                </p>
                <p className='mb-6'>
                    Please confirm the you are on the correct url.
                </p>
                <Link href="/" className='inline-block border border-purple-600 text-purple-600 font-semibold px-4 py-3 rounded-md'>Back to Home</Link>
            </div>
        </div>
    </div>
  );
}

export default NotFound