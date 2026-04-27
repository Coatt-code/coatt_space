'use client';
import { useState, useEffect } from "react";
export default function Page () {
    const [board, setBoard] = useState([
        ['1','2','3','4','5','6','7','8','9'],['','','','','','','','',''],['','','','','','','','',''],
        ['','','','','','','','',''],['','','','','','','','',''],['','','','','','','','',''],
        ['','','','','','','','',''],['','','','','','','','',''],['','','','','','','','','3']
    ]);
    const [selectedCell, setSelectedCell] = useState();
    
    function fillBoard() {

    }

    return (<>
    <div className="h-dvh w-screen p-3 md:p-6 flex flex-col">
        <p className="text-center mb-4">sudoku</p>
        <div className="grid grid-cols-9 grid-rows-9 max-w-xl aspect-square rounded-md overflow-hidden border bg-neutral-800">
            {board.map((row) =>
                row.map((cell) => (
                <div className="grid place-items-center border border-neutral-900 text-lg md:text-xl hover:bg-blue-900/10 hover:scale-110 transition-transform">
                    {cell}
                </div>
            )))}
        </div>
    </div>
    </>)
}