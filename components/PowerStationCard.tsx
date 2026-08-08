"use client";

import { motion } from "framer-motion";

import { ArrowRight, BatteryCharging, Sun, Zap } from "lucide-react";

import { PowerStation } from "@/types/powerstation";

import Link from "next/link";
import Image from "next/image";

interface Props {

    station: PowerStation;

}

export default function PowerStationCard({

    station,

}: Props) {

    return (

        <motion.div

        initial={{
            opacity:0,
            y:30
        }}

        animate={{
            opacity:1,
            y:0
        }}

        transition={{
            duration:0.5
        }}

        whileHover={{
            y:-8
        }}

        className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40">

            <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-black to-zinc-950">

                <Image
                    src={station.image ?? "/images/powerstations/placeholder.svg"}
                    alt={`${station.brand} ${station.model}`}
                    width={800}
                    height={520}
                    className="h-full w-full object-cover"
                />

            </div>

            <div className="p-6">

                <h2 className="text-2xl font-semibold">

                    {station.brand}

                </h2>

                <p className="text-zinc-400">

                    {station.model}

                </p>

                <div className="mt-6 space-y-3">

                    <div className="flex justify-between">

                        <span className="flex items-center gap-2">

                            <BatteryCharging size={18}/>

                            Capacidad

                        </span>

                        <strong>

                            {station.capacity} Wh

                        </strong>

                    </div>

                    <div className="flex justify-between">

                        <span className="flex items-center gap-2">

                            <Zap size={18}/>

                            Inversor

                        </span>

                        <strong>

                            {station.inverter} W

                        </strong>

                    </div>

                    <div className="flex justify-between">

                        <span className="flex items-center gap-2">

                            <Sun size={18}/>

                            Solar

                        </span>

                        <strong>

                            {station.solarInput.maxPower} W

                        </strong>

                    </div>

                </div>

                <Link
                    href={`/station/${station.id}`}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-500"
                    >

                    Ver detalles

                    <ArrowRight size={18}/>

                </Link>

            </div>

        </motion.div>

    );

}