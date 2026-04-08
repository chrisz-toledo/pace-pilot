"use client";

import { useState, useMemo, useRef } from "react";
import type { Lang } from "@/lib/locales";
import { MENU_ITEMS, CATEGORY_META, type MenuItem, type MenuCategory } from "@/lib/menu-items";

// ─── Food visual types ────────────────────────────────────────────────────────

type FoodVisualType =
  | "bun_crown" | "bun_heel" | "muffin" | "biscuit" | "hotcake" | "bun_generic"
  | "patty" | "chicken" | "fish" | "bacon" | "canadian_bacon" | "sausage"
  | "egg" | "cheese" | "butter"
  | "lettuce" | "tomato" | "pickle" | "onion"
  | "sauce_special" | "sauce_tartar" | "ketchup" | "mustard" | "mayo" | "bbq"
  | "caramel" | "chocolate" | "syrup"
  | "espresso" | "ice" | "foam" | "cup_drink"
  | "fries" | "hash_brown" | "salt" | "oreo" | "apple" | "hotcake_stack"
  | "default";

// ─── CSS food piece illustrations ─────────────────────────────────────────────

function FoodPiece({ type, size = 52 }: { type: FoodVisualType; size?: number }) {
  const s = size;

  switch (type) {

    // ── Buns ──────────────────────────────────────────────────────────────────

    case "bun_crown": return (
      <div style={{ position: "relative", width: s * 0.92, height: s * 0.52 }}>
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50% 50% 40% 40% / 65% 65% 35% 35%",
          background: "radial-gradient(ellipse at 50% 35%, #f8dd8a 0%, #e5a83c 48%, #c07625 85%)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.45), inset 0 -3px 6px rgba(120,58,0,0.4)",
        }} />
        {/* sesame seeds */}
        {([[20,30],[42,14],[66,22],[55,38],[33,44]] as [number,number][]).map(([x,y],i) => (
          <div key={i} style={{
            position:"absolute", left:`${x}%`, top:`${y}%`,
            width:"10%", height:"6%", background:"#b86a15",
            borderRadius:"50%", transform:`rotate(${[-20,10,-14,25,-5][i]}deg)`,
          }} />
        ))}
      </div>
    );

    case "bun_heel": return (
      <div style={{
        width: s * 0.92, height: s * 0.32,
        borderRadius: "50%",
        background: "radial-gradient(ellipse at 50% 38%, #f0cb70 0%, #d4954a 52%, #b87030 100%)",
        boxShadow: "0 4px 10px rgba(0,0,0,0.5), inset 0 -3px 5px rgba(120,58,0,0.4)",
      }} />
    );

    case "muffin": return (
      <div style={{ position:"relative", width:s*0.82, height:s*0.44 }}>
        <div style={{
          position:"absolute", inset:0, borderRadius:"10px",
          background:"linear-gradient(180deg,#e8c46a 0%,#d4975c 50%,#b87040 100%)",
          boxShadow:"0 4px 10px rgba(0,0,0,0.45)",
        }} />
        <div style={{
          position:"absolute", inset:"3px",
          borderRadius:"8px",
          background:"linear-gradient(180deg,#f5d580 0%,#e8a852 100%)",
        }} />
        {/* toasted edge crumb texture */}
        {[1,2,3].map(i => (
          <div key={i} style={{
            position:"absolute", top:`${18+i*22}%`, left:"8%", right:"8%",
            height:"1px", background:"rgba(150,80,20,0.3)",
          }} />
        ))}
      </div>
    );

    case "biscuit": return (
      <div style={{ position:"relative", width:s*0.82, height:s*0.54, overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0, borderRadius:"12px",
          background:"linear-gradient(180deg,#f5d590 0%,#e8b852 50%,#d09530 100%)",
          boxShadow:"0 4px 10px rgba(0,0,0,0.4)",
        }} />
        {[1,2,3].map(i=>(
          <div key={i} style={{
            position:"absolute", top:`${i*25}%`, left:"5%", right:"5%",
            height:"1px", background:"rgba(180,100,25,0.4)",
          }} />
        ))}
      </div>
    );

    case "hotcake":
    case "hotcake_stack": return (
      <div style={{ display:"flex", flexDirection:"column-reverse", gap:"2px", alignItems:"center" }}>
        {[0.9,0.82,0.72].map((scale,i) => (
          <div key={i} style={{
            width:s*scale*0.82, height:s*0.18,
            borderRadius:"50%",
            background:`linear-gradient(180deg,#d4884a 0%,#c07030 60%,#a05020 100%)`,
            boxShadow:"0 2px 4px rgba(0,0,0,0.3)",
          }} />
        ))}
      </div>
    );

    case "bun_generic": return (
      <div style={{
        width:s*0.78, height:s*0.78, borderRadius:"50%",
        background:"radial-gradient(ellipse at 45% 35%,#f8dc8a 0%,#e5a83c 50%,#c07825 85%)",
        boxShadow:"0 4px 10px rgba(0,0,0,0.45)",
      }} />
    );

    // ── Proteins ──────────────────────────────────────────────────────────────

    case "patty": return (
      <div style={{ position:"relative", width:s*0.9, height:s*0.5, overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"48% 52% 53% 47% / 45% 48% 52% 55%",
          background:"radial-gradient(ellipse at 44% 35%,#8B4010 0%,#6b2e0c 55%,#4a1e08 100%)",
          boxShadow:"0 5px 12px rgba(0,0,0,0.6), inset 0 -4px 8px rgba(20,5,0,0.5)",
        }} />
        {/* grill marks */}
        {[20,42,63].map((top,i)=>(
          <div key={i} style={{
            position:"absolute", top:`${top}%`, left:"6%", right:"6%",
            height:"4px", background:"rgba(15,5,0,0.55)", borderRadius:"2px",
            transform:"rotate(-12deg)",
          }} />
        ))}
        {/* highlight */}
        <div style={{
          position:"absolute", top:"12%", left:"22%",
          width:"38%", height:"32%",
          background:"rgba(180,88,28,0.2)", borderRadius:"50%",
        }} />
      </div>
    );

    case "chicken": return (
      <div style={{ position:"relative", width:s*0.88, height:s*0.58, overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"42% 58% 50% 50% / 55% 48% 52% 45%",
          background:"radial-gradient(ellipse at 45% 35%,#f5c860 0%,#e8a030 55%,#c07020 100%)",
          boxShadow:"0 4px 10px rgba(0,0,0,0.4), inset 0 -3px 6px rgba(100,50,0,0.3)",
        }} />
        {([[30,24],[56,17],[72,40],[40,56],[18,44]] as [number,number][]).map(([x,y],i)=>(
          <div key={i} style={{
            position:"absolute", left:`${x}%`, top:`${y}%`,
            width:"8%", height:"8%",
            borderRadius:"50%", background:"rgba(160,75,8,0.35)",
          }} />
        ))}
      </div>
    );

    case "fish": return (
      <div style={{ position:"relative", width:s*0.9, height:s*0.46, borderRadius:"10px", overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(180deg,#f5d896 0%,#e5b852 50%,#c8922a 100%)",
          borderRadius:"10px",
          boxShadow:"0 4px 10px rgba(0,0,0,0.4)",
        }} />
        {[0,1,2].map(i=>(
          <div key={i} style={{
            position:"absolute", top:`${20+i*27}%`, left:"5%", right:"5%",
            height:"1px", background:"rgba(160,98,18,0.3)",
          }} />
        ))}
      </div>
    );

    case "bacon": return (
      <div style={{ position:"relative", width:s*0.9, height:s*0.34, borderRadius:"6px", overflow:"hidden" }}>
        {[0,1,2,3,4].map(i=>(
          <div key={i} style={{
            position:"absolute", top:0, bottom:0,
            left:`${i*20}%`, width:"19%",
            background:i%2===0
              ?"linear-gradient(180deg,#c0392b,#922b21)"
              :"linear-gradient(180deg,#f5cba7,#e8b89a)",
            borderRadius:"3px",
          }} />
        ))}
        <div style={{
          position:"absolute", inset:0,
          boxShadow:"inset 0 0 8px rgba(0,0,0,0.3)", borderRadius:"6px",
        }} />
      </div>
    );

    case "canadian_bacon": return (
      <div style={{ position:"relative", width:s*0.72, height:s*0.72, overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          background:"radial-gradient(ellipse at 45% 35%,#d0785a 0%,#b04030 60%,#8a2018 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.4)",
        }} />
        <div style={{
          position:"absolute", inset:"10%", borderRadius:"50%",
          border:"6px solid rgba(230,180,120,0.45)",
        }} />
      </div>
    );

    case "sausage": return (
      <div style={{
        width:s*0.82, height:s*0.82, borderRadius:"50%",
        background:"radial-gradient(ellipse at 40% 35%,#c87850 0%,#9a5020 60%,#6e3010 100%)",
        boxShadow:"0 4px 10px rgba(0,0,0,0.45), inset 0 -3px 6px rgba(50,10,0,0.4)",
      }} />
    );

    case "egg": return (
      <div style={{ position:"relative", width:s*0.84, height:s*0.74 }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"48% 52% 50% 50% / 55% 55% 45% 45%",
          background:"radial-gradient(ellipse at 50% 45%,#fffde7 0%,#f5f0dc 60%,#e8e0c0 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.35)",
        }} />
        <div style={{
          position:"absolute", top:"18%", left:"28%", right:"28%", bottom:"16%",
          borderRadius:"50%",
          background:"radial-gradient(ellipse at 45% 38%,#ffe566 0%,#ffc107 55%,#f59000 100%)",
          boxShadow:"0 2px 6px rgba(0,0,0,0.25)",
        }} />
      </div>
    );

    // ── Dairy ─────────────────────────────────────────────────────────────────

    case "cheese": return (
      <div style={{
        width:s*0.86, height:s*0.23,
        background:"linear-gradient(170deg,#ffd740 0%,#ffb300 60%,#f59500 100%)",
        borderRadius:"3px",
        boxShadow:"0 3px 8px rgba(180,98,0,0.5)",
        transform:"rotate(2deg)",
      }} />
    );

    case "butter": return (
      <div style={{
        width:s*0.72, height:s*0.30,
        background:"linear-gradient(180deg,#fff176 0%,#fdd835 60%,#f9a825 100%)",
        borderRadius:"5px",
        boxShadow:"0 3px 8px rgba(0,0,0,0.35)",
      }} />
    );

    // ── Vegetables ────────────────────────────────────────────────────────────

    case "lettuce": return (
      <div style={{ position:"relative", width:s*0.94, height:s*0.5, overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"38% 62% 58% 42% / 42% 38% 62% 58%",
          background:"radial-gradient(ellipse at 40% 40%,#a8d85a 0%,#5fa825 60%,#407d18 100%)",
          boxShadow:"0 4px 10px rgba(0,0,0,0.35)",
        }} />
        <div style={{ position:"absolute", top:"18%", left:"28%", width:"28%", height:"28%", background:"rgba(200,255,100,0.28)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", top:"50%", left:"58%", width:"22%", height:"22%", background:"rgba(180,255,80,0.22)", borderRadius:"50%" }} />
      </div>
    );

    case "tomato": return (
      <div style={{ position:"relative", width:s*0.84, height:s*0.84, overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          background:"radial-gradient(ellipse at 40% 35%,#ff6b50 0%,#e82020 55%,#b81010 100%)",
          boxShadow:"0 4px 10px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(100,0,0,0.3)",
        }} />
        {[0,72,144,216,288].map((angle)=>(
          <div key={angle} style={{
            position:"absolute", top:"50%", left:"50%",
            width:"42%", height:"1px",
            background:"rgba(180,20,20,0.32)",
            transformOrigin:"0 50%",
            transform:`rotate(${angle}deg)`,
          }} />
        ))}
      </div>
    );

    case "pickle": return (
      <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
        {[0,1].map(i=>(
          <div key={i} style={{
            width:s*0.32, height:s*0.32, borderRadius:"50%",
            background:"radial-gradient(ellipse at 40% 35%,#7cc444 0%,#4a8c1e 60%,#2e6010 100%)",
            boxShadow:"0 2px 6px rgba(0,0,0,0.4)",
          }} />
        ))}
      </div>
    );

    case "onion": return (
      <div style={{ position:"relative", width:s*0.82, height:s*0.38 }}>
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          border:"5px solid rgba(235,205,165,0.9)",
          boxShadow:"0 2px 6px rgba(0,0,0,0.3)",
        }} />
        <div style={{
          position:"absolute", inset:"10px", borderRadius:"50%",
          border:"4px solid rgba(205,175,130,0.8)",
        }} />
        <div style={{
          position:"absolute", inset:"22px", borderRadius:"50%",
          border:"3px solid rgba(180,148,105,0.6)",
        }} />
      </div>
    );

    // ── Sauces ────────────────────────────────────────────────────────────────

    case "sauce_special": return (
      <div style={{ position:"relative", width:s*0.74, height:s*0.54, overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"45% 55% 40% 60% / 55% 45% 65% 35%",
          background:"radial-gradient(ellipse at 45% 40%,#f5c842 0%,#e8a020 60%,#c87a10 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.3)",
        }} />
      </div>
    );

    case "sauce_tartar":
    case "mayo": return (
      <div style={{ position:"relative", width:s*0.74, height:s*0.54, overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"48% 52% 42% 58% / 58% 42% 68% 32%",
          background:"radial-gradient(ellipse at 45% 40%,#fffde7 0%,#f5f0d0 60%,#e8dca8 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.3)",
        }} />
      </div>
    );

    case "ketchup": return (
      <div style={{ position:"relative", width:s*0.74, height:s*0.54, overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"45% 55% 42% 58% / 58% 42% 68% 32%",
          background:"radial-gradient(ellipse at 45% 40%,#ff5252 0%,#d32f2f 60%,#b71c1c 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.3)",
        }} />
      </div>
    );

    case "mustard": return (
      <div style={{ position:"relative", width:s*0.84, height:s*0.30, overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"30% 70% 25% 75% / 50% 50% 50% 50%",
          background:"linear-gradient(135deg,#fdd835 0%,#f9a825 60%,#e65100 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.3)",
        }} />
      </div>
    );

    case "bbq": return (
      <div style={{ position:"relative", width:s*0.74, height:s*0.54 }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"48% 52% 40% 60% / 55% 45% 65% 35%",
          background:"radial-gradient(ellipse at 45% 40%,#8d4004 0%,#5c2800 60%,#3e1800 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.4)",
        }} />
      </div>
    );

    case "caramel": return (
      <div style={{ position:"relative", width:s*0.76, height:s*0.56 }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"30% 70% 45% 55% / 55% 45% 60% 40%",
          background:"radial-gradient(ellipse at 45% 40%,#ffb300 0%,#e65100 60%,#bf360c 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.3)",
        }} />
      </div>
    );

    case "chocolate": return (
      <div style={{ position:"relative", width:s*0.76, height:s*0.56 }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"30% 70% 45% 55% / 55% 45% 60% 40%",
          background:"radial-gradient(ellipse at 45% 40%,#6d4c41 0%,#4e342e 60%,#3e2723 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.3)",
        }} />
      </div>
    );

    case "syrup": return (
      <div style={{ position:"relative", width:s*0.76, height:s*0.56 }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"30% 70% 45% 55% / 55% 45% 60% 40%",
          background:"radial-gradient(ellipse at 45% 40%,#ffe082 0%,#ffb300 60%,#e65100 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.3)",
        }} />
      </div>
    );

    // ── Drinks ────────────────────────────────────────────────────────────────

    case "espresso": return (
      <div style={{ position:"relative", width:s*0.62, height:s*0.62 }}>
        <div style={{
          position:"absolute", inset:0,
          borderRadius:"40% 40% 50% 50% / 30% 30% 70% 70%",
          background:"linear-gradient(180deg,#4e342e 0%,#3e2723 100%)",
          boxShadow:"0 3px 8px rgba(0,0,0,0.5)",
        }} />
        <div style={{
          position:"absolute", top:"10%", left:"12%", right:"12%", height:"32%",
          borderRadius:"50%",
          background:"radial-gradient(ellipse at 40% 35%,#795548 0%,#4e342e 100%)",
        }} />
        <div style={{
          position:"absolute", top:"16%", left:"36%",
          width:"20%", height:"20%",
          borderRadius:"50%", background:"rgba(200,155,95,0.55)",
        }} />
      </div>
    );

    case "ice": return (
      <div style={{ display:"flex", gap:"4px" }}>
        {[0,1].map(i=>(
          <div key={i} style={{
            width:s*0.36, height:s*0.44, borderRadius:"6px",
            background:"linear-gradient(135deg,rgba(200,240,255,0.92) 0%,rgba(150,210,245,0.87) 50%,rgba(100,180,230,0.82) 100%)",
            boxShadow:"0 2px 6px rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.6)",
            transform:`rotate(${[-8,5][i]}deg)`,
          }} />
        ))}
      </div>
    );

    case "foam": return (
      <div style={{ position:"relative", width:s*0.84, height:s*0.42 }}>
        {([[0,0,"48%"],[30,5,"40%"],[55,2,"45%"],[15,40,"35%"],[40,38,"38%"],[62,40,"32%"]] as [number,number,string][]).map(([x,y,sz],i)=>(
          <div key={i} style={{
            position:"absolute", left:`${x}%`, top:`${y}%`,
            width:sz, height:sz, borderRadius:"50%",
            background:"radial-gradient(ellipse at 40% 35%,#ffffff 0%,#f0e8d8 60%)",
            boxShadow:"0 2px 4px rgba(0,0,0,0.15)",
          }} />
        ))}
      </div>
    );

    case "cup_drink": return (
      <div style={{ position:"relative", width:s*0.58, height:s*0.84 }}>
        <div style={{
          position:"absolute", top:"12%", left:"5%", right:"5%", bottom:0,
          background:"linear-gradient(180deg,#e53935 0%,#c62828 100%)",
          borderRadius:"3px 3px 7px 7px",
          clipPath:"polygon(8% 0%,92% 0%,100% 100%,0% 100%)",
          boxShadow:"0 4px 10px rgba(0,0,0,0.4)",
        }} />
        {/* lid */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:"18%",
          background:"#ef5350",
          borderRadius:"50% 50% 0 0 / 80% 80% 0 0",
        }} />
        {/* straw */}
        <div style={{
          position:"absolute", top:"-5%", left:"58%",
          width:"8%", height:"55%",
          background:"rgba(255,255,255,0.7)",
          borderRadius:"4px",
        }} />
      </div>
    );

    // ── Sides ─────────────────────────────────────────────────────────────────

    case "fries": return (
      <div style={{ display:"flex", gap:"2px", alignItems:"flex-end", height:s*0.76 }}>
        {[0.76,1,0.85,0.66,0.9].map((hr,i)=>(
          <div key={i} style={{
            width:"13%", height:`${hr*100}%`,
            background:`linear-gradient(180deg,#fdd835 0%,#f9a825 60%,#e65100 100%)`,
            borderRadius:"3px 3px 1px 1px",
            boxShadow:"0 2px 4px rgba(0,0,0,0.3)",
          }} />
        ))}
      </div>
    );

    case "hash_brown": return (
      <div style={{ position:"relative", width:s*0.9, height:s*0.44, borderRadius:"8px", overflow:"hidden" }}>
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(180deg,#fdd835 0%,#f9a825 45%,#e65100 100%)",
          borderRadius:"8px", boxShadow:"0 4px 10px rgba(0,0,0,0.4)",
        }} />
        {[0,1,2].map(i=>(
          <div key={i} style={{
            position:"absolute", top:0, bottom:0, left:`${28+i*22}%`, width:"1px",
            background:"rgba(180,75,0,0.3)",
          }} />
        ))}
        {[0,1].map(i=>(
          <div key={i} style={{
            position:"absolute", left:0, right:0, top:`${28+i*38}%`, height:"1px",
            background:"rgba(180,75,0,0.3)",
          }} />
        ))}
      </div>
    );

    case "salt": return (
      <div style={{ display:"flex", flexWrap:"wrap", gap:"3px", width:s*0.68, justifyContent:"center" }}>
        {Array.from({length:9}).map((_,i)=>(
          <div key={i} style={{
            width:"26%", aspectRatio:"1",
            background:"rgba(240,240,240,0.9)", borderRadius:"2px",
            boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
          }} />
        ))}
      </div>
    );

    case "oreo": return (
      <div style={{ position:"relative", width:s*0.74, height:s*0.74 }}>
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          background:"radial-gradient(ellipse at 40% 35%,#424242 0%,#212121 70%)",
          boxShadow:"0 4px 10px rgba(0,0,0,0.5)",
        }} />
        {([[28,18],[55,22],[18,48],[50,48],[36,70]] as [number,number][]).map(([x,y],i)=>(
          <div key={i} style={{
            position:"absolute", left:`${x}%`, top:`${y}%`,
            width:"12%", height:"12%", borderRadius:"50%",
            background:"rgba(240,235,220,0.82)",
          }} />
        ))}
      </div>
    );

    case "apple": return (
      <div style={{ position:"relative", width:s*0.7, height:s*0.74 }}>
        <div style={{
          position:"absolute", top:"10%", bottom:0, left:0, right:0,
          borderRadius:"45% 45% 50% 50% / 40% 40% 60% 60%",
          background:"radial-gradient(ellipse at 40% 35%,#ef5350 0%,#c62828 60%,#b71c1c 100%)",
          boxShadow:"0 4px 10px rgba(0,0,0,0.4)",
        }} />
        <div style={{
          position:"absolute", top:0, left:"42%",
          width:"10%", height:"20%",
          background:"#4caf50", borderRadius:"4px",
        }} />
      </div>
    );

    default: return (
      <div style={{
        width:s*0.7, height:s*0.7, borderRadius:"50%",
        background:"radial-gradient(ellipse at 45% 35%,#8d6e63 0%,#5d4037 60%,#3e2723 100%)",
        boxShadow:"0 3px 8px rgba(0,0,0,0.4)",
      }} />
    );
  }
}

// ─── Ingredient visual lookup ──────────────────────────────────────────────────

interface IngredientVisual {
  labelEn: string;
  labelEs: string;
  visualType: FoodVisualType;
  trayEmoji: string; // small emoji only used in the tray row (not in tiles)
}

const STEP_VISUALS: Array<{ pattern: RegExp } & IngredientVisual> = [
  { pattern: /toast.*muffin|english muffin/i, trayEmoji:"🫓", labelEn:"Toast Muffin", labelEs:"Tostar Muffin", visualType:"muffin" },
  { pattern: /heel|bottom.*bun|bottom.*half/i, trayEmoji:"🫓", labelEn:"Heel",          labelEs:"Heel",         visualType:"bun_heel" },
  { pattern: /crown|top.*bun|top.*half/i,      trayEmoji:"🍞", labelEn:"Crown",         labelEs:"Crown",        visualType:"bun_crown" },
  { pattern: /biscuit/i,                       trayEmoji:"🥯", labelEn:"Biscuit",       labelEs:"Biscuit",      visualType:"biscuit" },
  { pattern: /hotcake|pancake/i,               trayEmoji:"🥞", labelEn:"Hotcake",       labelEs:"Hotcake",      visualType:"hotcake" },
  { pattern: /hoagie|roll|bun/i,               trayEmoji:"🥖", labelEn:"Bun",           labelEs:"Pan",          visualType:"bun_generic" },
  { pattern: /canadian bacon/i,                trayEmoji:"🥓", labelEn:"Can. Bacon",    labelEs:"Bacon",        visualType:"canadian_bacon" },
  { pattern: /bacon/i,                         trayEmoji:"🥓", labelEn:"Bacon",         labelEs:"Bacon",        visualType:"bacon" },
  { pattern: /sausage patty|sausage/i,         trayEmoji:"🌭", labelEn:"Sausage",       labelEs:"Salchicha",    visualType:"sausage" },
  { pattern: /mcrib|rib patty/i,               trayEmoji:"🍖", labelEn:"McRib",         labelEs:"McRib",        visualType:"patty" },
  { pattern: /beef patty|beef|patty/i,         trayEmoji:"🥩", labelEn:"Beef",          labelEs:"Res",          visualType:"patty" },
  { pattern: /fish fillet|filet/i,             trayEmoji:"🐟", labelEn:"Fish",          labelEs:"Filete",       visualType:"fish" },
  { pattern: /chicken|nugget/i,                trayEmoji:"🍗", labelEn:"Chicken",       labelEs:"Pollo",        visualType:"chicken" },
  { pattern: /round egg|folded egg|scrambled egg|egg/i, trayEmoji:"🥚", labelEn:"Egg", labelEs:"Huevo",        visualType:"egg" },
  { pattern: /cheddar|american cheese|cheese/i,trayEmoji:"🧀", labelEn:"Cheese",        labelEs:"Queso",        visualType:"cheese" },
  { pattern: /butter/i,                        trayEmoji:"🧈", labelEn:"Butter",        labelEs:"Mantequilla",  visualType:"butter" },
  { pattern: /whipped cream|whip/i,            trayEmoji:"🍦", labelEn:"Whip Cream",    labelEs:"Crema",        visualType:"foam" },
  { pattern: /steamed milk|skim milk|milk/i,   trayEmoji:"🥛", labelEn:"Milk",          labelEs:"Leche",        visualType:"foam" },
  { pattern: /pickle/i,                        trayEmoji:"🥒", labelEn:"Pickles",       labelEs:"Pepinos",      visualType:"pickle" },
  { pattern: /onion ring|onion/i,              trayEmoji:"🧅", labelEn:"Onions",        labelEs:"Cebolla",      visualType:"onion" },
  { pattern: /shredded lettuce|lettuce leaf|lettuce/i, trayEmoji:"🥬", labelEn:"Lettuce", labelEs:"Lechuga",    visualType:"lettuce" },
  { pattern: /tomato/i,                        trayEmoji:"🍅", labelEn:"Tomato",        labelEs:"Tomate",       visualType:"tomato" },
  { pattern: /special sauce|big mac sauce/i,   trayEmoji:"🫙", labelEn:"Sp. Sauce",     labelEs:"Salsa Esp.",   visualType:"sauce_special" },
  { pattern: /tartar/i,                        trayEmoji:"🫙", labelEn:"Tartar",        labelEs:"Tártara",      visualType:"sauce_tartar" },
  { pattern: /ketchup/i,                       trayEmoji:"🍅", labelEn:"Ketchup",       labelEs:"Ketchup",      visualType:"ketchup" },
  { pattern: /mustard/i,                       trayEmoji:"💛", labelEn:"Mustard",       labelEs:"Mostaza",      visualType:"mustard" },
  { pattern: /mayonnaise|mayo/i,               trayEmoji:"🤍", labelEn:"Mayo",          labelEs:"Mayo",         visualType:"mayo" },
  { pattern: /bbq sauce/i,                     trayEmoji:"🟫", labelEn:"BBQ",           labelEs:"BBQ",          visualType:"bbq" },
  { pattern: /maple syrup|syrup/i,             trayEmoji:"🍯", labelEn:"Syrup",         labelEs:"Jarabe",       visualType:"syrup" },
  { pattern: /caramel sauce|caramel drizzle|caramel/i, trayEmoji:"🍮", labelEn:"Caramel", labelEs:"Caramelo",   visualType:"caramel" },
  { pattern: /chocolate|mocha/i,               trayEmoji:"🍫", labelEn:"Chocolate",     labelEs:"Chocolate",    visualType:"chocolate" },
  { pattern: /vanilla syrup|vanilla/i,         trayEmoji:"🤍", labelEn:"Vanilla",       labelEs:"Vainilla",     visualType:"mayo" },
  { pattern: /sauce/i,                         trayEmoji:"🫙", labelEn:"Sauce",         labelEs:"Salsa",        visualType:"sauce_special" },
  { pattern: /espresso shot|espresso/i,        trayEmoji:"☕", labelEn:"Espresso",      labelEs:"Espresso",     visualType:"espresso" },
  { pattern: /coffee/i,                        trayEmoji:"☕", labelEn:"Coffee",        labelEs:"Café",         visualType:"espresso" },
  { pattern: /ice/i,                           trayEmoji:"🧊", labelEn:"Ice",           labelEs:"Hielo",        visualType:"ice" },
  { pattern: /foam/i,                          trayEmoji:"☁️", labelEn:"Foam",          labelEs:"Espuma",       visualType:"foam" },
  { pattern: /cup|fill.*cup|pour/i,            trayEmoji:"🥤", labelEn:"Cup",           labelEs:"Vaso",         visualType:"cup_drink" },
  { pattern: /oreo|cookie crumble/i,           trayEmoji:"🍪", labelEn:"Oreo",          labelEs:"Oreo",         visualType:"oreo" },
  { pattern: /blend|mix|stir/i,               trayEmoji:"🌀", labelEn:"Blend",          labelEs:"Mezclar",      visualType:"cup_drink" },
  { pattern: /lid|straw|cover/i,              trayEmoji:"🔴", labelEn:"Lid",            labelEs:"Tapa",         visualType:"cup_drink" },
  { pattern: /hash brown/i,                   trayEmoji:"🟫", labelEn:"Hash Brown",     labelEs:"Hash Brown",   visualType:"hash_brown" },
  { pattern: /fri|potato|basket/i,            trayEmoji:"🍟", labelEn:"Fries",          labelEs:"Papas",        visualType:"fries" },
  { pattern: /salt/i,                         trayEmoji:"🧂", labelEn:"Salt",           labelEs:"Sal",          visualType:"salt" },
  { pattern: /apple|fruit/i,                  trayEmoji:"🍎", labelEn:"Apple",          labelEs:"Manzana",      visualType:"apple" },
  { pattern: /dipping/i,                      trayEmoji:"🫙", labelEn:"Dip Sauce",      labelEs:"Salsa Dip",    visualType:"ketchup" },
];

function getIngredientVisual(stepText: string): IngredientVisual {
  for (const v of STEP_VISUALS) {
    if (v.pattern.test(stepText)) return { trayEmoji: v.trayEmoji, labelEn: v.labelEn, labelEs: v.labelEs, visualType: v.visualType };
  }
  const words = stepText.split(/\s+/).slice(0, 2).join(" ");
  return { trayEmoji: "🍽️", labelEn: words, labelEs: words, visualType: "default" };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getStars(mistakes: number): 1 | 2 | 3 {
  if (mistakes === 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

function loadMastery(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem("pace_mastery") ?? "{}"); }
  catch { return {}; }
}

function saveMastery(id: string, stars: number) {
  try {
    const m = loadMastery();
    if (!m[id] || m[id] < stars) m[id] = stars;
    localStorage.setItem("pace_mastery", JSON.stringify(m));
  } catch { /* noop */ }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GameView = "categories" | "items" | "playing" | "result";

interface ShuffledStep {
  text: string;
  originalIndex: number;
  visual: IngredientVisual;
}

// ─── Kitchen POV Play Screen ──────────────────────────────────────────────────

function KitchenPlayScreen({
  item, shuffledSteps, currentStep, tappedCorrect, mistakes, wrongFlashIdx,
  isEs, onBack, onDrop,
}: {
  item: MenuItem;
  shuffledSteps: ShuffledStep[];
  currentStep: number;
  tappedCorrect: Set<number>;
  mistakes: number;
  wrongFlashIdx: number | null;
  isEs: boolean;
  onBack: () => void;
  onDrop: (idx: number) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const [isOverDrop, setIsOverDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const trayScrollRef = useRef<HTMLDivElement>(null);

  const totalSteps = item.steps.length;
  const ghostStep = dragIdx !== null ? shuffledSteps[dragIdx] : null;

  const builtLayers: Array<{ trayEmoji: string; visualType: FoodVisualType; label: string; step: number }> = [];
  for (let i = 0; i < currentStep; i++) {
    const found = shuffledSteps.find((s) => s.originalIndex === i);
    if (found) builtLayers.push({
      trayEmoji: found.visual.trayEmoji,
      visualType: found.visual.visualType,
      label: isEs ? found.visual.labelEs : found.visual.labelEn,
      step: i + 1,
    });
  }

  function checkOverDrop(x: number, y: number) {
    const rect = dropRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function scrollTrayBottom() {
    setTimeout(() => { trayScrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" }); }, 80);
  }

  return (
    <div className={`flex flex-col h-full select-none overflow-hidden${dragIdx !== null ? " touch-none" : ""}`}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 shrink-0">
        <button onClick={onBack} className="text-[11px] font-bold text-white/40 shrink-0">
          ← {isEs ? "Atrás" : "Back"}
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-lg leading-none shrink-0">{item.emoji}</span>
          <p className="text-sm font-black text-cream truncate">{isEs ? item.nameEs : item.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {mistakes > 0 && <span className="text-[10px] font-black text-red-400">✗{mistakes}</span>}
          <span className="text-[11px] font-black text-white/30">{currentStep}<span className="text-white/15">/{totalSteps}</span></span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 mx-4 mb-2 bg-white/8 rounded-full overflow-hidden shrink-0">
        <div className="h-full bg-gold rounded-full transition-all duration-400" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
      </div>

      {/* Assembly Tray */}
      <div className="flex-1 min-h-0 mx-3 mb-2 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 mb-1.5 px-1 shrink-0">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
            {isEs ? "🥡 Bandeja de ensamble" : "🥡 Assembly Tray"}
          </span>
          <div className="flex-1 h-px bg-white/6" />
        </div>

        <div
          ref={dropRef}
          className={`flex-1 rounded-2xl overflow-hidden flex flex-col transition-all duration-150
            ${isOverDrop
              ? "ring-2 ring-gold/70 shadow-[inset_0_0_30px_rgba(255,188,0,0.08),0_0_20px_rgba(255,188,0,0.15)]"
              : "ring-1 ring-white/6"
            }`}
          style={{ background: "rgba(28,28,30,0.97)" }}
        >
          <div ref={trayScrollRef} className="flex-1 overflow-y-auto px-3 pt-2 pb-1">
            {builtLayers.length === 0 && !isOverDrop && (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
                <span className="text-3xl opacity-20">{item.emoji}</span>
                <p className="text-[10px] text-white/15 italic">
                  {isEs ? "Arrastra el primer ingrediente aquí" : "Drag the first ingredient here"}
                </p>
              </div>
            )}

            {builtLayers.map((layer, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <span className="text-[9px] font-black text-white/20 w-4 text-right shrink-0">{layer.step}</span>
                {/* small food visual in tray row */}
                <div className="shrink-0 flex items-center justify-center" style={{ width: 28, height: 28 }}>
                  <FoodPiece type={layer.visualType} size={28} />
                </div>
                <span className="text-xs font-bold text-white/55 flex-1 truncate">{layer.label}</span>
                <span className="text-emerald-400/70 text-xs shrink-0">✓</span>
              </div>
            ))}

            {currentStep < totalSteps && (
              <div className={`flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl border-2 border-dashed transition-all duration-150
                ${isOverDrop && ghostStep
                  ? "border-gold/80 bg-gold/10 scale-[1.015]"
                  : "border-white/12 bg-white/[0.02]"
                }`}>
                <span className="text-[9px] font-black text-white/20 w-4 text-right shrink-0">{currentStep + 1}</span>
                {isOverDrop && ghostStep ? (
                  <>
                    <div className="shrink-0 flex items-center justify-center" style={{ width: 28, height: 28 }}>
                      <FoodPiece type={ghostStep.visual.visualType} size={28} />
                    </div>
                    <span className="text-xs font-black text-gold/90 flex-1 truncate">
                      {isEs ? ghostStep.visual.labelEs : ghostStep.visual.labelEn}
                    </span>
                    <span className="text-gold text-xs shrink-0">↓</span>
                  </>
                ) : (
                  <>
                    <div className="shrink-0 w-7 h-7 rounded-lg border border-dashed border-white/15 flex items-center justify-center">
                      <span className="text-white/20 text-sm animate-pulse">?</span>
                    </div>
                    <span className="text-[10px] text-white/15 italic flex-1">
                      {isEs ? "Suelta aquí…" : "Drop here…"}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prep counter divider */}
      <div className="flex items-center gap-3 px-4 mb-2 shrink-0">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
          {isEs ? "🍳 Estación de Prep" : "🍳 Prep Station"}
        </span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Ingredient tiles — food visuals, NO emojis */}
      <div className="px-3 pb-4 shrink-0">
        <div className="grid grid-cols-4 gap-2">
          {shuffledSteps.map((step, i) => {
            const isDone = tappedCorrect.has(i);
            const isWrong = wrongFlashIdx === i;
            const isDragging = dragIdx === i;

            if (isDone) {
              return (
                <div key={i} className="aspect-square rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-emerald-500/25 text-base">✓</span>
                </div>
              );
            }

            return (
              <div
                key={i}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDragIdx(i);
                  setGhostPos({ x: e.clientX, y: e.clientY });
                  setIsOverDrop(checkOverDrop(e.clientX, e.clientY));
                }}
                onPointerMove={(e) => {
                  if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
                  setGhostPos({ x: e.clientX, y: e.clientY });
                  setIsOverDrop(checkOverDrop(e.clientX, e.clientY));
                }}
                onPointerUp={(e) => {
                  if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
                  if (checkOverDrop(e.clientX, e.clientY)) { onDrop(i); scrollTrayBottom(); }
                  setDragIdx(null);
                  setIsOverDrop(false);
                }}
                onPointerCancel={() => { setDragIdx(null); setIsOverDrop(false); }}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1
                  cursor-grab touch-none select-none transition-all duration-100
                  ${isDragging ? "opacity-15 scale-90" : isWrong ? "scale-95" : "active:scale-95"}`}
                style={{
                  background: isDragging ? "rgba(255,255,255,0.03)" : isWrong ? "rgba(220,38,38,0.15)" : "rgba(38,38,40,1)",
                  boxShadow: isDragging || isWrong ? "none" : "0 4px 0 rgba(0,0,0,0.45), 0 6px 16px rgba(0,0,0,0.3)",
                  border: isWrong ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Real food piece visual */}
                <div className="flex items-center justify-center" style={{ width: "72%", height: "72%", position: "relative" }}>
                  <FoodPiece type={step.visual.visualType} size={48} />
                </div>
                {/* Tiny label for accessibility */}
                <span className="text-[7px] font-bold text-white/35 text-center leading-tight px-1 line-clamp-1 w-full">
                  {isEs ? step.visual.labelEs : step.visual.labelEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ghost card */}
      {dragIdx !== null && ghostStep && (
        <div
          className="fixed pointer-events-none z-50 flex flex-col items-center justify-center gap-1 rounded-2xl"
          style={{
            left: ghostPos.x - 40,
            top: ghostPos.y - 52,
            width: 80,
            height: 80,
            background: "rgba(38,38,40,0.98)",
            border: `2px solid ${isOverDrop ? "rgba(255,188,0,0.9)" : "rgba(255,255,255,0.15)"}`,
            boxShadow: isOverDrop
              ? "0 16px 40px rgba(0,0,0,0.8), 0 0 24px rgba(255,188,0,0.35)"
              : "0 20px 50px rgba(0,0,0,0.75), 0 8px 20px rgba(0,0,0,0.5)",
            transform: `scale(1.18) rotate(${isOverDrop ? "0deg" : "-4deg"})`,
            transition: "transform 0.1s ease, border-color 0.1s ease, box-shadow 0.1s ease",
          }}
        >
          <div className="flex items-center justify-center" style={{ width: 52, height: 52 }}>
            <FoodPiece type={ghostStep.visual.visualType} size={52} />
          </div>
          <span className="text-[7px] font-bold text-white/70 text-center leading-tight px-1.5 line-clamp-1">
            {isEs ? ghostStep.visual.labelEs : ghostStep.visual.labelEn}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MenuBuildGame({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const isEs = lang === "es";

  const [mastery, setMastery] = useState<Record<string, number>>(loadMastery);
  const [view, setView] = useState<GameView>("categories");
  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [shuffledSteps, setShuffledSteps] = useState<ShuffledStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [tappedCorrect, setTappedCorrect] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrongFlashIdx, setWrongFlashIdx] = useState<number | null>(null);
  const [resultStars, setResultStars] = useState<1 | 2 | 3 | null>(null);
  const [resultMistakes, setResultMistakes] = useState(0);

  const t = useMemo(() => isEs ? {
    title: "Practicar Menú", chooseCategory: "Elige una categoría",
    back: "← Atrás", close: "✕", mastered_of: "dominados", steps_label: "pasos",
    tryAgain: "Intentar de nuevo", nextItem: "Siguiente:", backToList: "Ver lista",
    stars3: "¡Perfecto!", stars2: "¡Bien hecho!", stars1: "¡Sigue practicando!",
  } : {
    title: "Practice Menu", chooseCategory: "Choose a category",
    back: "← Back", close: "✕", mastered_of: "mastered", steps_label: "steps",
    tryAgain: "Try again", nextItem: "Next:", backToList: "Back to list",
    stars3: "Perfect!", stars2: "Good job!", stars1: "Keep practicing!",
  }, [isEs]);

  const categoryItems = useMemo(
    () => category ? MENU_ITEMS.filter((i) => i.category === category) : [],
    [category]
  );

  function startGame(selected: MenuItem) {
    const shuffled = shuffle(
      selected.steps.map((text, originalIndex) => ({
        text, originalIndex, visual: getIngredientVisual(text),
      }))
    );
    setItem(selected);
    setShuffledSteps(shuffled);
    setCurrentStep(0);
    setTappedCorrect(new Set());
    setMistakes(0);
    setWrongFlashIdx(null);
    setResultStars(null);
    setView("playing");
  }

  function handleDrop(shuffledIdx: number) {
    if (!item || tappedCorrect.has(shuffledIdx)) return;
    const dropped = shuffledSteps[shuffledIdx];
    if (dropped.originalIndex === currentStep) {
      const newTapped = new Set(tappedCorrect);
      newTapped.add(shuffledIdx);
      setTappedCorrect(newTapped);
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next === item.steps.length) {
        const stars = getStars(mistakes);
        saveMastery(item.id, stars);
        setMastery(loadMastery());
        setResultStars(stars);
        setResultMistakes(mistakes);
        setView("result");
      }
    } else {
      setMistakes((m) => m + 1);
      setWrongFlashIdx(shuffledIdx);
      setTimeout(() => setWrongFlashIdx(null), 500);
    }
  }

  function getNextItem(): MenuItem | null {
    if (!category || !item) return null;
    const items = MENU_ITEMS.filter((i) => i.category === category);
    const idx = items.findIndex((i) => i.id === item.id);
    return items[(idx + 1) % items.length] ?? null;
  }

  // ── 1. Categories ─────────────────────────────────────────────────────────
  if (view === "categories") {
    const cats = Object.entries(CATEGORY_META) as [MenuCategory, typeof CATEGORY_META[MenuCategory]][];
    return (
      <div className="flex flex-col gap-4 p-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-black text-gold uppercase tracking-widest">{t.title}</p>
            <p className="text-xs text-white/40 mt-0.5">{t.chooseCategory}</p>
          </div>
          <button onClick={onClose} className="text-[13px] font-bold text-white/30 w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">{t.close}</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {cats.map(([key, meta]) => {
            const items = MENU_ITEMS.filter((i) => i.category === key);
            const masteredCount = items.filter((i) => mastery[i.id] === 3).length;
            const pct = Math.round((masteredCount / items.length) * 100);
            return (
              <button key={key} onClick={() => { setCategory(key); setView("items"); }}
                className="bg-card rounded-2xl p-4 flex flex-col gap-2 active:scale-[0.97] transition-transform text-left">
                <span className="text-4xl leading-none">{meta.emoji}</span>
                <p className="text-sm font-black text-cream">{isEs ? meta.labelEs : meta.labelEn}</p>
                <div className="flex flex-col gap-1">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-white/35">{masteredCount}/{items.length} {t.mastered_of}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 2. Items ──────────────────────────────────────────────────────────────
  if (view === "items" && category) {
    const meta = CATEGORY_META[category];
    return (
      <div className="flex flex-col gap-3 p-4 pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("categories")} className="text-[11px] font-bold text-white/40 shrink-0">{t.back}</button>
          <p className="text-base font-black text-gold flex items-center gap-2">
            <span>{meta.emoji}</span><span>{isEs ? meta.labelEs : meta.labelEn}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {categoryItems.map((menuItem) => {
            const stars = mastery[menuItem.id] ?? 0;
            return (
              <button key={menuItem.id} onClick={() => startGame(menuItem)}
                className="bg-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
                <span className="text-2xl leading-none shrink-0">{menuItem.emoji}</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-black text-cream truncate">{isEs ? menuItem.nameEs : menuItem.name}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">{menuItem.steps.length} {t.steps_label}</p>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  {[1,2,3].map((s) => <span key={s} className={`text-base leading-none ${stars>=s?"text-gold":"text-white/12"}`}>★</span>)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 3. Playing ────────────────────────────────────────────────────────────
  if (view === "playing" && item) {
    return (
      <KitchenPlayScreen
        item={item} shuffledSteps={shuffledSteps} currentStep={currentStep}
        tappedCorrect={tappedCorrect} mistakes={mistakes} wrongFlashIdx={wrongFlashIdx}
        isEs={isEs} onBack={() => setView("items")} onDrop={handleDrop}
      />
    );
  }

  // ── 4. Result ─────────────────────────────────────────────────────────────
  if (view === "result" && item && resultStars !== null) {
    const next = getNextItem();
    const headline = resultStars === 3 ? t.stars3 : resultStars === 2 ? t.stars2 : t.stars1;
    const tip = isEs ? item.tipEs : item.tipEn;
    const assemblyVisuals = item.steps.map((s) => getIngredientVisual(s));

    return (
      <div className="flex flex-col items-center gap-5 p-6 text-center pb-10">
        <span className="text-6xl mt-2">{item.emoji}</span>
        <div>
          <p className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-2">{isEs ? item.nameEs : item.name}</p>
          <div className="flex justify-center gap-2 mb-2">
            {[1,2,3].map((s) => <span key={s} className={`text-4xl leading-none ${resultStars>=s?"text-gold":"text-white/12"}`}>★</span>)}
          </div>
          <p className="text-lg font-black text-cream">{headline}</p>
          {resultMistakes > 0 && <p className="text-[11px] text-white/35 mt-1">{resultMistakes} {isEs?"error(es)":"mistake(s)"}</p>}
        </div>

        {/* Correct sequence — small food pieces */}
        <div className="bg-card rounded-2xl px-4 py-3 w-full">
          <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-3 text-left">
            {isEs ? "Secuencia correcta" : "Correct sequence"}
          </p>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {assemblyVisuals.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div style={{ width: 32, height: 32 }} className="flex items-center justify-center">
                  <FoodPiece type={v.visualType} size={30} />
                </div>
                <span className="text-[6px] text-white/30">{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {tip && (
          <div className="bg-card border border-gold/20 rounded-2xl p-4 w-full text-left">
            <p className="text-[10px] font-black text-gold/50 uppercase tracking-widest mb-1">💡 Pro tip</p>
            <p className="text-xs text-white/65 leading-relaxed">{tip}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          <button onClick={() => startGame(item)} className="w-full py-3.5 rounded-2xl bg-white/8 text-white/60 font-black text-sm">{t.tryAgain}</button>
          {next && (
            <button onClick={() => startGame(next)} className="w-full py-3.5 rounded-2xl bg-gold text-black font-black text-sm">
              {t.nextItem} {next.emoji} {isEs ? next.nameEs : next.name}
            </button>
          )}
          <button onClick={() => setView("items")} className="w-full py-3 rounded-2xl bg-card text-white/40 font-bold text-sm">{t.backToList}</button>
        </div>
      </div>
    );
  }

  return null;
}
