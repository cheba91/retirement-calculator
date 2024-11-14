const chartHeight=32;let fixedBarCount=49;const optimalValues={},calcSelectors=["retirement-age","expectancy","expected-stocks","expected-bonds","expected-btc","expected-cash","growth-rate","retirement-income","retirement-expenses","capital-gains","inflation-rate"],calcElementsAndRanges=[],inputValues={"btc-price":65e3},onlyNumbers=e=>+String(e).replace(/\D/g,""),formatPercent=e=>`${e}%`,formatToFixed=(e,t=0)=>+e.toFixed(t),formatCurrencyShort=(e,t=0)=>e>=1e12?`$${(e/1e12).toFixed(1)}T`:e>=1e9?`$${(e/1e9).toFixed(1)}B`:e>=1e6?`$${(e/1e6).toFixed(t)}M`:e>=1e3?`$${(e/1e3).toFixed()}K`:`$${e}`,formatCurrency=(e,t=0)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:t,maximumFractionDigits:t}).format(e),getBitcoinPrice=async()=>{try{const e=await fetch("https://blockchain.info/ticker"),t=(await e.json()).USD.last;currentBtcPrice=t,console.log(`Current Bitcoin Price in USD: $${t}`)}catch(e){console.error("Error fetching Bitcoin price:",e)}},updateRangeSliderScale=(e,t,a,n,r,c,i)=>{const s=(n-a)/(fixedBarCount-1),u=Math.round((r-a)/s);if(i===u)return"#E9EBF2";if(c){if(i<u){const e=.24+.6*((u-i)/u);return`rgba(57, 158, 106, ${Math.min(e,1)})`}{const e=.24+.6*((i-u)/(fixedBarCount-u));return`rgba(255, 91, 59, ${Math.min(e,1)})`}}if(i<u){const e=.24+.6*((u-i)/u);return`rgba(255, 91, 59, ${Math.min(e,1)})`}{const e=.24+.6*((i-u)/(fixedBarCount-u));return`rgba(57, 158, 106, ${Math.min(e,1)})`}},updateAllRangesliders=()=>{calcElementsAndRanges.forEach((e=>{const{selector:t,slider:a,min:n,max:r,step:c}=e,i=(a.value,optimalValues[t]),s=optimalValues[`${t}-reversed`];optimalValues[`${t}-bars`].attr("fill",((e,t)=>updateRangeSliderScale(0,0,n,r,i,s,t)))}))},updateHandle=(e,t)=>{const a=document.querySelector(`#${e} .calc__slider__scale__item.is--mid`),n=document.querySelector(`#${e} input[type="range"]`),r=(t-n.min)/(n.max-n.min),c=r*n.offsetWidth,i=100*r;"true"===a.getAttribute("is-percent")?a.innerText=formatPercent(t):"true"===a.getAttribute("is-usd")?a.innerText=formatCurrencyShort(t):a.innerText=onlyNumbers(t),i>97&&(a.nextElementSibling.style.opacity=0),i<3&&(a.previousElementSibling.style.opacity=0),i>3&&i<97&&(a.nextElementSibling.style.opacity=1,a.previousElementSibling.style.opacity=1),a.style.left=c+"px",a.style.transform=`translateX(-${i}%)`},initRangeSliders=()=>{calcSelectors.forEach((e=>{const t=document.querySelector(`#${e}`);if(!t)return void console.error(`Slider container not found for selector: ${e}`);const a=t.querySelector(".calc__graph");if(!a)return void console.error(`Graph container not found for selector: ${e}`);let n=a.clientWidth;const r=window.innerWidth<768?3:4,c=d3.select(a).append("svg").attr("width",n).attr("height",32),i=t.querySelector(".calc__slider-range");if(!i)return void console.error(`Slider not found for selector: ${e}`);i.min,i.max;const s=d3.range(fixedBarCount),u=(n-r*(fixedBarCount-1))/fixedBarCount,l=d3.scaleBand().domain(s).range([0,n]).paddingInner(r/(u+r)),o=c.selectAll("rect").data(s).enter().append("rect").attr("x",(e=>l(e))).attr("y",0).attr("width",u).attr("height",32);optimalValues[`${e}-bars`]=o;const p=()=>{const t=+i.value;updateAllRangesliders(),updateHandle(e,t)};let d;i.addEventListener("input",(()=>{clearTimeout(d),d=setTimeout((()=>{const a=i.value;inputValues[e]=onlyNumbers(a),p();const n=t.querySelector(`#${e}-i`);n&&("true"===n.getAttribute("is-percent")?n.value=formatPercent(a):"true"===n.getAttribute("is-usd")?n.value=formatCurrency(a):n.value=onlyNumbers(a)),runCalculations()}),10)})),p();const m=()=>{n=a.clientWidth;const e=(n-r*(fixedBarCount-1))/fixedBarCount;l.range([0,n]),o.attr("x",(e=>l(e))).attr("width",e),p()};let V;window.addEventListener("resize",(()=>{clearTimeout(V),V=setTimeout(m,100)}));const b=t.querySelector(`#${e}-i`);b&&b.addEventListener("blur",(()=>{setTimeout((()=>{inputValues[e]=onlyNumbers(b.value),i.value=onlyNumbers(b.value),p()}),10)}))}))};window.addEventListener("load",(async()=>{await getBitcoinPrice();const e={},t=new URLSearchParams(window.location.search);for(const[a,n]of t)e[a]=n;window.innerWidth<768&&(fixedBarCount=35),calcSelectors.forEach((e=>{const t=document.querySelector(`#${e}`);if(!t)return void console.error(`Slider container not found for selector: ${e}`);const a=t.querySelector(".calc__graph");if(!a)return void console.error(`Graph container not found for selector: ${e}`);let n=a.clientWidth;const r=window.innerWidth<768?3:4,c=d3.select(a).append("svg").attr("width",n).attr("height",32),i=t.querySelector(".calc__slider-range");if(!i)return void console.error(`Slider not found for selector: ${e}`);i.min,i.max;const s=d3.range(fixedBarCount),u=(n-r*(fixedBarCount-1))/fixedBarCount,l=d3.scaleBand().domain(s).range([0,n]).paddingInner(r/(u+r)),o=c.selectAll("rect").data(s).enter().append("rect").attr("x",(e=>l(e))).attr("y",0).attr("width",u).attr("height",32);optimalValues[`${e}-bars`]=o;const p=()=>{const t=+i.value;updateAllRangesliders(),updateHandle(e,t)};let d;i.addEventListener("input",(()=>{clearTimeout(d),d=setTimeout((()=>{const a=i.value;inputValues[e]=onlyNumbers(a),p();const n=t.querySelector(`#${e}-i`);n&&("true"===n.getAttribute("is-percent")?n.value=formatPercent(a):"true"===n.getAttribute("is-usd")?n.value=formatCurrency(a):n.value=onlyNumbers(a)),runCalculations()}),10)})),p();const m=()=>{n=a.clientWidth;const e=(n-r*(fixedBarCount-1))/fixedBarCount;l.range([0,n]),o.attr("x",(e=>l(e))).attr("width",e),p()};let V;window.addEventListener("resize",(()=>{clearTimeout(V),V=setTimeout(m,100)}));const b=t.querySelector(`#${e}-i`);b&&b.addEventListener("blur",(()=>{setTimeout((()=>{inputValues[e]=onlyNumbers(b.value),i.value=onlyNumbers(b.value),p()}),10)}))})),calcSelectors.forEach((t=>{const a=document.querySelector(`#${t} .calc__slider-range`);calcElementsAndRanges.push({selector:t,slider:a,element:a,min:+a.getAttribute("min"),max:+a.getAttribute("max"),step:+a.getAttribute("step")}),a&&(e[t]&&(a.value=e[t]),a.dispatchEvent(new Event("input")),runCalculations())}));document.querySelectorAll('.calc-field[is-age="true"]').forEach((e=>{const t=+e.getAttribute("max-age"),a=+e.getAttribute("min-age");e.addEventListener("input",(()=>e.value=onlyNumbers(e.value))),e.addEventListener("blur",(()=>{let n=onlyNumbers(e.value);n>t&&(n=t),n<a&&(n=a),e.value=n,inputValues[e.id]=n;const r=e.closest(".calc-range__wrap")?.querySelector(".calc__slider-range");r?(r.value=n,r.dispatchEvent(new Event("input"))):runCalculations(),console.log(e.id,"input value: ",e.value,"max age: ",t,"min age:",a,"used value: ",n)}))}));document.querySelectorAll('.calc-field[is-percent="true"]').forEach((e=>{const t=+e.getAttribute("max-percent"),a=+e.getAttribute("min-percent");e.addEventListener("blur",(()=>{let n=onlyNumbers(e.value);n>t&&(n=t),n<a&&(n=a),e.value=formatPercent(n),inputValues[e.id]=n/100;const r=e.closest(".calc-range__wrap")?.querySelector(".calc__slider-range");r?(r.value=n,r.dispatchEvent(new Event("input"))):runCalculations(),console.log(e.id,"input value: ",e.value,"only numbers: ",onlyNumbers(e.value),"used value: ",n/100)}))}));document.querySelectorAll('.calc-field[is-usd="true"]').forEach((e=>{const t=+e.getAttribute("max-usd"),a=+e.getAttribute("min-usd");e.addEventListener("blur",(()=>{let n=onlyNumbers(e.value);n>t&&(n=t),n<a&&(n=a),e.value=formatCurrency(n),inputValues[e.id]=n;const r=e.closest(".calc-range__wrap")?.querySelector(".calc__slider-range");r?(r.value=n,r.dispatchEvent(new Event("input"))):runCalculations(),console.log(e.id,"input value: ",e.value,"only numbers: ",onlyNumbers(e.value),"used value: ",n)}))})),document.querySelectorAll(".calc-radio input").forEach((e=>{e.addEventListener("change",(()=>{inputValues[e.name]=e.value,runCalculations(),console.log(e.name,"radio value: ",e.value)}))})),document.querySelectorAll("input[init-value]").forEach((t=>{t.value=e[t.id]||t.getAttribute("init-value"),t.dispatchEvent(new Event("blur")),runCalculations()})),document.querySelectorAll('.calc-radio input[name="plan-type"]').forEach((e=>{e.addEventListener("change",(()=>{"custom"===document.querySelector('.calc-radio input[name="plan-type"]:checked').value?document.querySelector("#expected-btc").classList.remove("is--disabled"):document.querySelector("#expected-btc").classList.add("is--disabled")}))})),document.querySelectorAll("input[type='radio'][radio-initial='true']").forEach((t=>{const a=e[t.name];if(a===t.value)t.checked=!0,t.dispatchEvent(new Event("change",{bubbles:!0}));else{const e=t.closest(".calc-layout__radios").querySelector(`input[value="${a}"]`);e?(e.checked=!0,e.dispatchEvent(new Event("change",{bubbles:!0}))):(t.checked=!0,t.dispatchEvent(new Event("change",{bubbles:!0})))}runCalculations()})),document.querySelector("#share-btn").addEventListener("click",(function(){const e=this.textContent;this.textContent="Copied!",setTimeout((()=>this.textContent=e),2e3);const t=new URL(window.location.href),a=new URLSearchParams,n=["current-age","retirement-age","expectancy","balance-stocks","balance-bonds","balance-btc","balance-cash","additional-stocks","additional-bonds","additional-btc","additional-cash","expected-stocks","expected-bonds","expected-btc","plan-type","expected-cash","btc-account","growth-rate","retirement-income","retirement-expenses","capital-gains","inflation-rate"];n.forEach((e=>{console.log(e,inputValues[e])})),n.forEach((e=>inputValues[e]&&a.append(e,inputValues[e]))),t.search=a.toString(),navigator.clipboard.writeText(t.toString())})),document.querySelector("#reset-btn").addEventListener("click",(()=>{document.querySelectorAll("input[init-value]").forEach((e=>{e.value=e.getAttribute("init-value"),e.dispatchEvent(new Event("blur"))})),calcSelectors.forEach((e=>{const t=document.querySelector(`#${e} .calc__slider-range`);t&&(t.value=t.getAttribute("value"),t.dispatchEvent(new Event("input")))})),document.querySelectorAll("input[type='radio'][radio-initial='true']").forEach((e=>{e.checked=!0,e.dispatchEvent(new Event("change",{bubbles:!0}))})),runCalculations()})),window.dispatchEvent(new Event("resize"))}));const btcPricesS2F={2023:83667.67557239954,2024:686398.0127483337,2025:703741.9524243205,2026:721375.6236071566,2027:739301.4262968419,2028:5986997.015654025,2029:6060174.083947013,2030:6133945.0152537,2031:6208312.209574085,2032:49965761.24291532,2033:50266224.53526536,2034:50567889.953642786,2035:50870759.89804761,2036:408181178.5400824,2037:409398694.1478387,2038:410618628.40764976,2039:411840983.7195157,2040:3299624560.159754,2041:3304526099.867491,2042:3309432491.2793384,2043:3314343736.795295,2044:26534409444.738514,2045:26554078710.52289,2046:26573757694.115482,2047:26593446397.916298,2048:212826355165.1583,2049:212905158594.60263,2050:212983981474.06342,2051:213062823805.94064,2052:1704818018138.2832,2053:1705133484741.0745,2054:1705448990258.2983,2055:1705764534692.3552,2056:13647378572031.568,2057:13648640944365.16,2058:13649903394542.018,2059:13651165922564.541,2060:109214377726149.42,2061:109219428227481.05,2062:109224478884513.6,2063:109229529697249.48,2064:873856441296055.4,2065:873876645325528.8,2066:873896849666418.5,2067:873917054318726.8,2068:6991417254093309,2069:6991498074259649,2070:6991578895048836,2071:6991659716460872,2072:0xc6b75053c21058,2073:0xc6b79b99451880,2074:0xc6b7e6dedb22a8,2075:0xc6b83224842ee8,2076:0x635c2be3afeae80,2077:0x635c3eb5201ea00,2078:0x635c518692b2940,2079:0x635c645807a6d00,2080:357985909114264e4,2081:0x31ae3b94bf7da600,2082:0x31ae40491dc4d200,2083:0x31ae44fd7c580600,2084:0x18d723abd5df11000,2085:2863903825633595e4,2086:2863905894728015e4,2087:0x18d727331d3144000,2088:2291127198697211e5,2089:2291128026335876e5,2090:229112885397474e6,2091:0xc6b94c6a676750000,2092:1832904076346728e6,2093:1832904407402453e6,2094:1832904738458218e6,2095:1832905069514023e6,2096:14663241880335521e6,2097:14663243204558938e6,2098:14663244528782437e6,2099:14663245853006015e6,2100:11730597212094267e7,2101:11730597741783739e7,2102:11730598271473226e7,2103:1173059880116273e8,2104:9384479252805988e8,2105:9384479464681798e8,2106:938447967655761e9,2107:9384479888433425e8,2108:7507583995497068e9,2109:7507584080247396e9,2110:7507584164997724e9,2111:7507584249748053e9,2112:6006067433698574e10,2113:60060674675987065e9,2114:6006067501498839e10,2115:6006067535398971e10,2116:48048540418792296e10,2117:48048540554392825e10,2118:4804854068999335e11,2119:4804854082559388e11,2120:38438832714715317e11,2121:3843883276895553e12,2122:38438832823195746e11,2123:3843883287743595e12,2124:3075106632364485e13,2125:3075106634586495e13,2126:3075106636808505e13,2127:3075106639030515e13,2128:2460085306062612e14,2129:2460085306646612e14,2130:2460085307230612e14,2131:2460085307814612e14,2132:1.9680682457644895e30,2133:1.9680682458004896e30,2134:1.9680682458364897e30,2135:1.9680682458724895e30,2136:15744545966091917e15,2137:15744545966101917e15,2138:15744545966111917e15,2139:15744545966121917e15,2140:12595636772888455e16,2141:12595636772889454e16,2142:12595636772890454e16,2143:12595636772891456e16,2144:10076509418312764e17,2145:10076509418312863e17,2146:10076509418312964e17,2147:10076509418313064e17,2148:806120753465051e19,2149:806120753465052e19,2150:806120753465053e19},btcPricesPowerLaw=(()=>{const e=[{time:1,price:.03},{time:2,price:1.17},{time:3,price:9.91},{time:4,price:45.2},{time:5,price:146.7},{time:6,price:383.87},{time:7,price:865.75},{time:8,price:1751.3},{time:9,price:3260.17},{time:10,price:5684.04},{time:11,price:9398.21},{time:12,price:14873.64},{time:13,price:22689.36},{time:14,price:33545.07},{time:15,price:89e3}].map((({time:e,price:t})=>({x:Math.log(e),y:Math.log(t)}))),t=e.length,a=e.reduce(((e,t)=>e+t.x),0),n=e.reduce(((e,t)=>e+t.y),0),r=(t*e.reduce(((e,t)=>e+t.x*t.y),0)-a*n)/(t*e.reduce(((e,t)=>e+t.x*t.x),0)-a*a),c=Math.exp((n-r*a)/t),i={};for(let e=0;e<150;e++){i[2010+e]=c*Math.pow(e+1,r)}return i})(),currentYear=(new Date).getFullYear();let currentBtcPrice=65e3;const btcPricesBtc24=()=>{const e=currentYear,t={[e]:currentBtcPrice};for(let a=1;a<=150;a++){const n=Math.max(50-2.5*(a-1),20),r=t[e+(a-1)];t[e+a]=r*(1+n/100)}return t},btcPricesCustom=e=>{const t={[currentYear]:currentBtcPrice};for(let a=1;a<=150;a++){const n=t[currentYear+a-1];t[currentYear+a]=n*(1+e/100)}return t},sidebarElements={};document.addEventListener("DOMContentLoaded",(()=>{sidebarElements.retireBy=document.querySelector("#res-retire-by"),sidebarElements.portfolioAtRetirement=document.querySelector("#res-portfolio-retirement"),sidebarElements.btcAtRetirement=document.querySelector("#res-btc-retirement"),sidebarElements.btcPriceAtRetirement=document.querySelector("#res-btc-price-retirement"),sidebarElements.monthlyBudget=document.querySelector("#res-budget-monthly"),sidebarElements.annualBudget=document.querySelector("#res-budget-year"),sidebarElements.yearsOfWithdrawals=document.querySelector("#res-years-of-withdrawals"),sidebarElements.portfolioAtDeath=document.querySelector("#res-portfolio-at-death"),sidebarElements.successMessage=document.querySelector('.notification[notification="success"]'),sidebarElements.errorMessage=document.querySelector('.notification[notification="fail"]'),sidebarElements.mobileUnderline=document.querySelector(".calc-mobile__underline")}));const runCalculations=()=>{if(["btc-price","current-age","balance-stocks","balance-bonds","balance-btc","balance-cash","additional-stocks","additional-bonds","additional-btc","additional-cash","retirement-age","expectancy","expected-stocks","expected-bonds","expected-cash","expected-btc","growth-rate","retirement-income","retirement-expenses","capital-gains","inflation-rate","plan-type","btc-account"].filter((e=>!inputValues[e]&&0!==inputValues[e])).length>0)return;const e=inputValues["current-age"],t=(e,t)=>e[t],a=(e,t,a,n=!1,r=!0,c=inputValues["growth-rate"],i=inputValues["inflation-rate"])=>{const s={};s[currentYear]=e;for(let e=1;e<=a;e++){const a=s[currentYear+(e-1)],u=currentYear+e;if(r&&u>t)continue;const l=a*(1+(n?i:c)/100);s[u]=l}return s},n=(t,a,n,r,c=inputValues["capital-gains"])=>{const i={};for(let s=1;s<=r;s++){const r=currentYear+s,u=e+s>=60&&"roth"===a?0:c;if(r>n){let e;e="none"===a?t[r]/(1-u/100):t[r],i[r]=e}else i[r]=0}return i},r=(e,t,a,n,r,c,i,s,u,l,o,p,d=!0)=>{const m={},V={},b={},x={},y={},h={},f={},g={},v=(E=p,inputValues["balance-btc"],"btc24"===inputValues["plan-type"]?btcPricesBtc24():"power-law"===inputValues["plan-type"]?btcPricesPowerLaw:"custom"===inputValues["plan-type"]?btcPricesCustom(E):btcPricesS2F);var E;const w={},S={},C=u,k=l,A=o,B=inputValues["balance-bonds"],Y=inputValues["balance-stocks"],q=inputValues["balance-btc"],$=inputValues["balance-cash"];m[currentYear]=B+Y+q+$,V[currentYear]=q,x[currentYear]=Y,h[currentYear]=B,g[currentYear]=$,S[currentYear]=m[currentYear];for(let u=1;u<=i;u++){const i=currentYear+u,l=v[i],o=m[i-1]||0;let p=0,d=0,E=0;const B=e[i]-t[i]||0;if(i>s&&o>0&&0!==B){const e=V[i-1]||0,t=x[i-1]||0,a=h[i-1]||0;if(o>0){p=B*(e/o),d=B*(t/o),E=B*(a/o),B>0&&(p=Math.min(p,e),d=Math.min(d,t),E=Math.min(E,a))}}if(o>0){b[i]=-p,y[i]=-d,f[i]=-E;const e=l/v[i-1];V[i]=(V[i-1]||0)*e+(a[i]||0)+b[i],x[i]=(x[i-1]||0)*(1+C/100)+(n[i]||0)+y[i],h[i]=(h[i-1]||0)*(1+k/100)+(r[i]||0)+f[i],g[i]=(g[i-1]||0)*(1+A/100)+(c[i]||0),m[i]=Math.max(V[i]+x[i]+h[i]+g[i]-Math.max(B,0),0)}else V[i]=0,x[i]=0,h[i]=0,g[i]=0,m[i]=0;m[i]<=0?w[i]=!1:w[i]=!0;const Y=.6*S[i-1]*(1+C/100)+(n[i]||0)+y[i],q=.4*S[i-1]*(1+k/100)+(r[i]||0)+f[i];if(i>s){const t=Y+q,a=B*(t/m[i]),n=.6*a,r=.4*a;if(S[i-1]>0&&e[i]<t){const e=Y-n,t=q-r;S[i]=Math.max(e+t,0)}else S[i]=0}else S[i]=Y+q;isNaN(m[i])&&console.error("NaN detected in year:",i,{btcBalance:V[i],stocksBalance:x[i],bondsBalance:h[i],cashBalance:g[i],btcPrice:l,previousBtcPrice:v[i-1],withdrawals:{btc:b[i],stocks:y[i],bonds:f[i]}})}return{totalBalances:m,btcBalance:V,btcSold:b,stocksBalance:x,stocksSold:y,bondsBalance:h,bondsSold:f,cashIncomeBalance:g,btcPrices:v,retirementSuccessStatus:w,portfolio60_40:S}},c=a(inputValues["retirement-expenses"],currentYear+(inputValues["retirement-age"]-e),inputValues.expectancy,!0,!1),i=a(inputValues["additional-cash"],currentYear+(inputValues["retirement-age"]-e),inputValues.expectancy,!1,!1),s=a(inputValues["additional-bonds"],currentYear+(inputValues["retirement-age"]-e),inputValues.expectancy,!1,!0),u=a(inputValues["additional-stocks"],currentYear+(inputValues["retirement-age"]-e),inputValues.expectancy,!1,!0),l=a(inputValues["additional-btc"],currentYear+(inputValues["retirement-age"]-e),inputValues.expectancy,!1,!0),o=a(inputValues["retirement-income"],currentYear+(inputValues["retirement-age"]-e),inputValues.expectancy,!0,!1),p=(((e,t)=>{const a={};a[currentYear]=inputValues["balance-cash"];const n=inputValues["expected-cash"];for(let r=1;r<=t;r++){const t=a[currentYear+(r-1)],c=currentYear+r,i=e[c],s=t*(1+n/100);a[c]=s+i}})(i,inputValues.expectancy),n(c,inputValues["btc-account"],currentYear+(inputValues["retirement-age"]-e),inputValues.expectancy)),{totalBalances:d,btcBalance:m,btcSold:V,stocksBalance:b,stocksSold:x,bondsBalance:y,bondsSold:h,cashIncomeBalance:f,btcPrices:g,retirementSuccessStatus:v,portfolio60_40:E}=r(p,o,l,u,s,i,inputValues.expectancy,currentYear+(inputValues["retirement-age"]-e),inputValues["expected-stocks"],inputValues["expected-bonds"],inputValues["expected-cash"],inputValues["expected-btc"],!1);let w={};if("roth"!==inputValues["btc-account"]){const t="roth"!==inputValues["btc-account"]&&n(c,"roth",currentYear+(inputValues["retirement-age"]-e),inputValues.expectancy),{totalBalances:a,btcBalance:p,btcSold:d,stocksBalance:m,stocksSold:V,bondsBalance:b,bondsSold:x,cashIncomeBalance:y,btcPrices:h,retirementSuccessStatus:f,portfolio60_40:g}=r(t,o,l,u,s,i,inputValues.expectancy,currentYear+(inputValues["retirement-age"]-e),inputValues["expected-stocks"],inputValues["expected-bonds"],inputValues["expected-cash"],inputValues["expected-btc"]);w=a}const S=(C=c,k=currentYear+(inputValues["retirement-age"]-e),C[k]);var C,k;const A=((e,t)=>e[t])(d,currentYear+(inputValues["retirement-age"]-e)),B=t(d,currentYear-e+inputValues.expectancy);_.throttle((()=>{calcElementsAndRanges.forEach((c=>{const i=c.selector,s=c.min,u=c.max,l=c.step;if("retirement-age"===i){for(let c=s;c<=u;c+=l){const i=currentYear+(c-e),s=a(inputValues["retirement-expenses"],i,inputValues.expectancy,!0,!1),l=n(s,inputValues["btc-account"],i,inputValues.expectancy),o=a(inputValues["retirement-income"],i,inputValues.expectancy,!0,!1),p=a(inputValues["additional-btc"],i,inputValues.expectancy,!1,!0),d=a(inputValues["additional-stocks"],i,inputValues.expectancy,!1,!0),m=a(inputValues["additional-bonds"],i,inputValues.expectancy,!1,!0),V=a(inputValues["additional-cash"],i,inputValues.expectancy,!1,!1),{totalBalances:b}=r(l,o,p,d,m,V,inputValues.expectancy,i,inputValues["expected-stocks"],inputValues["expected-bonds"],inputValues["expected-cash"],inputValues["expected-btc"]);if(t(b,currentYear-e+inputValues.expectancy)>0){optimalValues["retirement-age"]=c;break}c>=u&&(optimalValues["retirement-age"]=u)}optimalValues["retirement-age-reversed"]=!1}else if("expectancy"===i){for(let c=s;c<=u;c+=l){const i=currentYear-e+c,s=a(inputValues["retirement-expenses"],currentYear+(inputValues["retirement-age"]-e),c,!0,!1),l=n(s,inputValues["btc-account"],currentYear+(inputValues["retirement-age"]-e),c),o=a(inputValues["retirement-income"],currentYear+(inputValues["retirement-age"]-e),c,!0,!1),p=a(inputValues["additional-btc"],currentYear+(inputValues["retirement-age"]-e),c,!1,!0),d=a(inputValues["additional-stocks"],currentYear+(inputValues["retirement-age"]-e),c,!1,!0),m=a(inputValues["additional-bonds"],currentYear+(inputValues["retirement-age"]-e),c,!1,!0),V=a(inputValues["additional-cash"],currentYear+(inputValues["retirement-age"]-e),c,!1,!1),{totalBalances:b}=r(l,o,p,d,m,V,c,currentYear+(inputValues["retirement-age"]-e),inputValues["expected-stocks"],inputValues["expected-bonds"],inputValues["expected-cash"],inputValues["expected-btc"]);if(t(b,i)<=0){optimalValues.expectancy=c-1;break}c>=u&&(optimalValues.expectancy=u)}optimalValues["expectancy-reversed"]=!0}else if("expected-stocks"===i){for(let c=s;c<=u;c+=l){const i=currentYear+(inputValues["retirement-age"]-e),s=a(inputValues["retirement-expenses"],i,inputValues.expectancy,!0,!1),l=n(s,inputValues["btc-account"],i,inputValues.expectancy),o=a(inputValues["retirement-income"],i,inputValues.expectancy,!0,!1),p=a(inputValues["additional-btc"],i,inputValues.expectancy,!1,!0),d=a(inputValues["additional-stocks"],i,inputValues.expectancy,!1,!0),m=a(inputValues["additional-bonds"],i,inputValues.expectancy,!1,!0),V=a(inputValues["additional-cash"],i,inputValues.expectancy,!1,!1),{totalBalances:b}=r(l,o,p,d,m,V,inputValues.expectancy,i,c,inputValues["expected-bonds"],inputValues["expected-cash"],inputValues["expected-btc"]);if(t(b,currentYear-e+inputValues.expectancy)>0){optimalValues["expected-stocks"]=c;break}c>=u&&(optimalValues["expected-stocks"]=u)}optimalValues["expected-stocks-reversed"]=!1}else if("expected-bonds"===i){for(let c=s;c<=u;c+=l){const i=currentYear+(inputValues["retirement-age"]-e),s=a(inputValues["retirement-expenses"],i,inputValues.expectancy,!0,!1),l=n(s,inputValues["btc-account"],i,inputValues.expectancy),o=a(inputValues["retirement-income"],i,inputValues.expectancy,!0,!1),p=a(inputValues["additional-btc"],i,inputValues.expectancy,!1,!0),d=a(inputValues["additional-stocks"],i,inputValues.expectancy,!1,!0),m=a(inputValues["additional-bonds"],i,inputValues.expectancy,!1,!0),V=a(inputValues["additional-cash"],i,inputValues.expectancy,!1,!1),{totalBalances:b}=r(l,o,p,d,m,V,inputValues.expectancy,i,inputValues["expected-stocks"],c,inputValues["expected-cash"],inputValues["expected-btc"]);if(t(b,currentYear-e+inputValues.expectancy)>0){optimalValues["expected-bonds"]=c;break}c>=u&&(optimalValues["expected-bonds"]=u)}optimalValues["expected-bonds-reversed"]=!1}else if("expected-cash"===i){for(let c=s;c<=u;c+=l){const i=currentYear+(inputValues["retirement-age"]-e),s=a(inputValues["retirement-expenses"],i,inputValues.expectancy,!0,!1),l=n(s,inputValues["btc-account"],i,inputValues.expectancy),o=a(inputValues["retirement-income"],i,inputValues.expectancy,!0,!1),p=a(inputValues["additional-btc"],i,inputValues.expectancy,!1,!0),d=a(inputValues["additional-stocks"],i,inputValues.expectancy,!1,!0),m=a(inputValues["additional-bonds"],i,inputValues.expectancy,!1,!0),V=a(inputValues["additional-cash"],i,inputValues.expectancy,!1,!1),{totalBalances:b}=r(l,o,p,d,m,V,inputValues.expectancy,i,inputValues["expected-stocks"],inputValues["expected-bonds"],c,inputValues["expected-btc"]);if(t(b,currentYear-e+inputValues.expectancy)>0){optimalValues["expected-cash"]=c;break}c>=u&&(optimalValues["expected-cash"]=u)}optimalValues["expected-cash-reversed"]=!1}else if("expected-btc"===i){for(let c=s;c<=u;c+=l){const i=currentYear+(inputValues["retirement-age"]-e),s=a(inputValues["retirement-expenses"],i,inputValues.expectancy,!0,!1),l=n(s,inputValues["btc-account"],i,inputValues.expectancy),o=a(inputValues["retirement-income"],i,inputValues.expectancy,!0,!1),p=a(inputValues["additional-btc"],i,inputValues.expectancy,!1,!0),d=a(inputValues["additional-stocks"],i,inputValues.expectancy,!1,!0),m=a(inputValues["additional-bonds"],i,inputValues.expectancy,!1,!0),V=a(inputValues["additional-cash"],i,inputValues.expectancy,!1,!1),{totalBalances:b}=r(l,o,p,d,m,V,inputValues.expectancy,i,inputValues["expected-stocks"],inputValues["expected-bonds"],inputValues["expected-cash"],c);if(t(b,currentYear-e+inputValues.expectancy)>0){optimalValues["expected-btc"]=c;break}c>=u&&(optimalValues["expected-btc"]=u)}optimalValues["expected-btc-reversed"]=!1}else if("growth-rate"===i){for(let c=s;c<=u;c+=l){const i=currentYear+(inputValues["retirement-age"]-e),s=a(inputValues["retirement-expenses"],i,inputValues.expectancy,!0,!1,c),l=n(s,inputValues["btc-account"],i,inputValues.expectancy),o=a(inputValues["retirement-income"],i,inputValues.expectancy,!0,!1,c),p=a(inputValues["additional-btc"],i,inputValues.expectancy,!1,!0,c),d=a(inputValues["additional-stocks"],i,inputValues.expectancy,!1,!0,c),m=a(inputValues["additional-bonds"],i,inputValues.expectancy,!1,!0,c),V=a(inputValues["additional-cash"],i,inputValues.expectancy,!1,!1,c),{totalBalances:b}=r(l,o,p,d,m,V,inputValues.expectancy,i,inputValues["expected-stocks"],inputValues["expected-bonds"],inputValues["expected-cash"],inputValues["expected-btc"]);if(t(b,currentYear-e+inputValues.expectancy)>0){optimalValues["growth-rate"]=c;break}c>=u&&(optimalValues["growth-rate"]=u)}optimalValues["growth-rate-reversed"]=!1}else if("retirement-income"===i){for(let c=s;c<=u;c+=2*l){const i=currentYear+(inputValues["retirement-age"]-e),s=a(inputValues["retirement-expenses"],i,inputValues.expectancy,!0,!1),u=n(s,inputValues["btc-account"],i,inputValues.expectancy),l=a(c,i,inputValues.expectancy,!0,!1),o=a(inputValues["additional-btc"],i,inputValues.expectancy,!1,!0),p=a(inputValues["additional-stocks"],i,inputValues.expectancy,!1,!0),d=a(inputValues["additional-bonds"],i,inputValues.expectancy,!1,!0),m=a(inputValues["additional-cash"],i,inputValues.expectancy,!1,!1),{totalBalances:V}=r(u,l,o,p,d,m,inputValues.expectancy,i,inputValues["expected-stocks"],inputValues["expected-bonds"],inputValues["expected-cash"],inputValues["expected-btc"]);if(t(V,currentYear-e+inputValues.expectancy)>0){optimalValues["retirement-income"]=c;break}}optimalValues["retirement-income-reversed"]=!1}else if("retirement-expenses"===i){for(let c=s;c<=u;c+=2*l){const i=currentYear+(inputValues["retirement-age"]-e),s=a(c,i,inputValues.expectancy,!0,!1),l=n(s,inputValues["btc-account"],i,inputValues.expectancy),o=a(inputValues["retirement-income"],i,inputValues.expectancy,!0,!1),p=a(inputValues["additional-btc"],i,inputValues.expectancy,!1,!0),d=a(inputValues["additional-stocks"],i,inputValues.expectancy,!1,!0),m=a(inputValues["additional-bonds"],i,inputValues.expectancy,!1,!0),V=a(inputValues["additional-cash"],i,inputValues.expectancy,!1,!1),{totalBalances:b}=r(l,o,p,d,m,V,inputValues.expectancy,i,inputValues["expected-stocks"],inputValues["expected-bonds"],inputValues["expected-cash"],inputValues["expected-btc"]);if(t(b,currentYear-e+inputValues.expectancy)<=0){optimalValues["retirement-expenses"]=c-1;break}c>=u&&(optimalValues["retirement-expenses"]=u)}optimalValues["retirement-expenses-reversed"]=!0}else if("capital-gains"===i){for(let c=s;c<=u;c+=l){const i=currentYear+(inputValues["retirement-age"]-e),s=a(inputValues["retirement-expenses"],i,inputValues.expectancy,!0,!1),l=n(s,inputValues["btc-account"],i,inputValues.expectancy,c),o=a(inputValues["retirement-income"],i,inputValues.expectancy,!0,!1),p=a(inputValues["additional-btc"],i,inputValues.expectancy,!1,!0),d=a(inputValues["additional-stocks"],i,inputValues.expectancy,!1,!0),m=a(inputValues["additional-bonds"],i,inputValues.expectancy,!1,!0),V=a(inputValues["additional-cash"],i,inputValues.expectancy,!1,!1),{totalBalances:b}=r(l,o,p,d,m,V,inputValues.expectancy,i,inputValues["expected-stocks"],inputValues["expected-bonds"],inputValues["expected-cash"],inputValues["expected-btc"]);if(t(b,currentYear-e+inputValues.expectancy)<=0){optimalValues["capital-gains"]=c-1;break}c>=u&&(optimalValues["capital-gains"]=u)}optimalValues["capital-gains-reversed"]=!0}else if("inflation-rate"===i){for(let c=s;c<=u;c+=l){const i=currentYear+(inputValues["retirement-age"]-e),s=a(inputValues["retirement-expenses"],i,inputValues.expectancy,!0,!1,inputValues["growth-rate"],c),l=n(s,inputValues["btc-account"],i,inputValues.expectancy),o=a(inputValues["retirement-income"],i,inputValues.expectancy,!0,!1,inputValues["growth-rate"],c),p=a(inputValues["additional-btc"],i,inputValues.expectancy,!1,!0,inputValues["growth-rate"],c),d=a(inputValues["additional-stocks"],i,inputValues.expectancy,!1,!0,inputValues["growth-rate"],c),m=a(inputValues["additional-bonds"],i,inputValues.expectancy,!1,!0,inputValues["growth-rate"],c),V=a(inputValues["additional-cash"],i,inputValues.expectancy,!1,!1,inputValues["growth-rate"],c),{totalBalances:b}=r(l,o,p,d,m,V,inputValues.expectancy,i,inputValues["expected-stocks"],inputValues["expected-bonds"],inputValues["expected-cash"],inputValues["expected-btc"]);if(t(b,currentYear-e+inputValues.expectancy)<=0){optimalValues["inflation-rate"]=c-1;break}c>=u&&(optimalValues["inflation-rate"]=u)}optimalValues["inflation-rate-reversed"]=!0}})),updateAllRangesliders()}),100,{trailing:!0})(),((e,t,a,n,r,c,i)=>{setTimeout((()=>{const s=((e,t)=>e[t])(a,currentYear+(inputValues["retirement-age"]-e));sidebarElements.retireBy&&(sidebarElements.retireBy.value=inputValues["retirement-age"]),sidebarElements.portfolioAtRetirement&&(sidebarElements.portfolioAtRetirement.value=formatCurrency(i)),sidebarElements.btcAtRetirement&&(sidebarElements.btcAtRetirement.value="₿"+formatCurrency(((e,t)=>e[t])(t,currentYear+(inputValues["retirement-age"]-e))/s,3).replace("$","")),sidebarElements.btcPriceAtRetirement&&(sidebarElements.btcPriceAtRetirement.value=formatCurrency(s)),sidebarElements.monthlyBudget&&(sidebarElements.monthlyBudget.value=formatCurrency(n/12)),sidebarElements.annualBudget&&(sidebarElements.annualBudget.value=formatCurrency(n)),sidebarElements.yearsOfWithdrawals&&(sidebarElements.yearsOfWithdrawals.value=formatToFixed(((e,t,a)=>{let n=0;for(let r=t;r<=a&&e[r];r++)n++;return n})(r,currentYear+(inputValues["retirement-age"]-e),currentYear-e+inputValues.expectancy),1)),sidebarElements.portfolioAtDeath&&(sidebarElements.portfolioAtDeath.value=formatCurrency(c)),c<=0?(sidebarElements.successMessage.classList.add("hidden"),sidebarElements.errorMessage.classList.remove("hidden"),sidebarElements.mobileUnderline.classList.remove("is--green")):(sidebarElements.successMessage.classList.remove("hidden"),sidebarElements.errorMessage.classList.add("hidden"),sidebarElements.mobileUnderline.classList.add("is--green"))}),50)})(e,m,g,S,v,B,A),updateMainChart(d,currentYear-e+inputValues.expectancy,e,E,w)};let chart,overviewChart,chartInited=!1,chartElements={};const updateMainChart=(e,t,a,n,r)=>{chartInited||(chartElements.resultsWrap=document.querySelector(".chart-wrap .chart-info"),chartElements.resultAge=document.querySelector("#chart-res-age"),chartElements.resultBtc=document.querySelector("#chart-res-btc"),chartElements.result60_40=document.querySelector("#chart-res-6040"),chartElements.resultRoth=document.querySelector("#chart-res-roth"),chartElements.rothWrap=document.querySelector(".chart-info #roth-wrap"),chartElements.resultDifference=document.querySelector("#chart-res-diff"));const c=[];for(let e=currentYear;e<=t;e++){const n=a+(e-currentYear);(e-currentYear)%10==0||e===t?c.push(n.toString()):c.push("")}const i=Object.fromEntries(Object.entries(e).filter((([e])=>Number(e)<=t))),s=Object.fromEntries(Object.entries(n).filter((([e])=>Number(e)<=t))),u={data:Object.values(i),borderColor:"#399E6A",fill:!1,borderWidth:2,tension:.4,pointRadius:0},l={data:Object.values(s),borderColor:"#0095D6",backgroundColor:"#CDEFFF33",fill:!0,borderWidth:2,tension:.4,pointRadius:0};let o={};if(Object.keys(r).length>0){const e=Object.fromEntries(Object.entries(r).filter((([e])=>Number(e)<=t)));o={data:Object.values(e),borderColor:"#db9905",fill:!1,borderWidth:2,tension:.4,pointRadius:0},u.borderDash=[0,0]}else o={data:Object.values(i),borderColor:"#db9905",fill:!1,borderWidth:2,tension:.4,pointRadius:0},u.borderDash=[10,10];const p=document.querySelector(".calculator-chart").getContext("2d"),d=document.querySelector(".overview-chart").getContext("2d");Chart.defaults.font.family="Inter, sans-serif",Chart.defaults.font.size=12,Chart.defaults.font.weight=600;const m={type:"line",data:{labels:c,datasets:[u,l]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{x:{beginAtZero:!1,border:{display:!0,color:"#0A5999",width:2},grid:{display:!1,drawOnChartArea:!1,drawBorder:!1,drawTicks:!1,offset:!1},title:{display:!0,text:"AGE",color:"#0A5999",font:{size:16,weight:"bold"}},ticks:{color:"#0A5999",size:12,weight:"bold",family:"Inter",autoSkip:!1,padding:18,rotation:0,minRotation:0,maxRotation:0,align:"start",crossAlign:"far"}},y:{beginAtZero:!1,grid:{display:!0,color:"#CCEAF7",drawBorder:!1,drawTicks:!1,offset:!1},border:{display:!0,color:"#0A5999",width:2},ticks:{padding:0,color:"#0A5999",size:12,weight:"bold",family:"Inter",callback:e=>formatCurrencyShort(e),padding:8},title:{display:!1}}},layout:{padding:10}},plugins:[{id:"corsair",defaults:{width:1,color:"#CCEAF7",dash:[3,3]},afterInit:(e,t,a)=>{e.corsair={x:0,y:0}},afterEvent:(e,t)=>{const{inChartArea:a}=t,{type:n,x:r,y:c}=t.event;e.corsair={x:r,y:c,draw:a},e.draw()},beforeDatasetsDraw:(e,t,a)=>{const{ctx:n}=e,{top:r,bottom:c}=e.chartArea,{x:i,draw:s}=e.corsair;s&&(n.save(),n.beginPath(),n.lineWidth=a.width,n.strokeStyle=a.color,n.moveTo(i,c),n.lineTo(i,r),n.stroke(),n.restore())}}]},V={type:"line",data:{labels:c,datasets:[u,l]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{x:{beginAtZero:!1,border:{display:!0,color:"#0A5999",width:2},grid:{display:!1,drawOnChartArea:!1,drawBorder:!1,drawTicks:!1,offset:!1},title:{display:!0,text:"AGE",color:"#0A5999",padding:10,font:{size:8,weight:"bold"}},ticks:{display:!1}},y:{beginAtZero:!1,grid:{display:!0,color:"#CCEAF7",drawBorder:!1,drawTicks:!1,offset:!1},border:{display:!0,color:"#0A5999",width:2},ticks:{display:!1},title:{display:!1}}},layout:{padding:{top:0,right:0,bottom:0,left:1}}}};Object.keys(o).length>0&&(m.data.datasets.push(o),V.data.datasets.push(o)),chartInited?(chart.data.labels=c,chart.data.datasets=m.data.datasets,chart.options=m.options,chart.update("none"),overviewChart.data.labels=c,overviewChart.data.datasets=V.data.datasets,overviewChart.options=V.options,overviewChart.update("none")):(chart=new Chart(p,m),overviewChart=new Chart(d,V),p.canvas.addEventListener("mousemove",(e=>{const t=chart.getElementsAtEventForMode(e,"index",{intersect:!1});if(t.length){const e=t[0].index,a=inputValues["current-age"]+e,n=chart.data.datasets[0].data[e],r=chart.data.datasets[1].data[e],c=chart.data.datasets[2]?.data[e]||0;chartElements.resultAge.textContent=a,chartElements.resultBtc.textContent=formatCurrency(n),chartElements.result60_40.textContent=formatCurrency(r),chartElements.resultRoth.textContent=formatCurrency(c),chartElements.resultDifference.textContent=formatCurrency(n-r),chartElements.resultsWrap.classList.remove("is--inactive")}else chartElements.resultsWrap.classList.add("is--inactive")})),p.canvas.addEventListener("mouseleave",(()=>{chartElements.resultsWrap.classList.add("is--inactive")})),chartInited=!0)};
