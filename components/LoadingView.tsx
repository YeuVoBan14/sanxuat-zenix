
import React from 'react'

export default function LoadingView() {

    return (
        <div className="flex justify-center items-center mt-48">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div>
                <h2 className="text-zinc-900 dark:text-white mt-4">Vui lòng đợi ....</h2>
            </div>
        </div>
    );
}