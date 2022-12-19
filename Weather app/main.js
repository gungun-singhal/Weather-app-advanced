const API_key="6fa77a211e6e508abdf41effba9f9be4";
const formatTemp= (temp)=> `${temp?.toFixed(2)}°`;
 const createIconUrl=(icon)=>`http://openweathermap.org/img/wn/${icon}@2x.png`;
const Days_Of_Week= ["sun", "mon", "tue", "wed", "thrus","fri","sat"];
let selectedCityText;// this is a string
let selectedCity;// this is a array
const getCitiesUsingGeoLocation= async(searchText)=>{
   const response= await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${API_key}`);
   // console.log(response.json);
   return response.json();
}

const getCurrentWeatherData= async({lat,lon,name:city})=>{
   const url= lat && lon? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`:`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`;
   // this particluar is for current weather
   const response= await fetch(url);
//    console.log(response.json);
   return response.json();
}

const loadCurrentForecast=({name, main:{temp,temp_min, temp_max},weather:[{description}]})=>{
    const CurrentForecastElement= document.querySelector("#current-forecast");
    CurrentForecastElement.querySelector(".city").textContent= name;
    CurrentForecastElement.querySelector(".temp").textContent=formatTemp(temp);
    CurrentForecastElement.querySelector(".des").textContent= description;
    CurrentForecastElement.querySelector(".min-max").textContent= `High: ${formatTemp(temp_max)} Low:${formatTemp(temp_min)}`;
}
const getHourlyWeatherData= async({name:city})=>{
    const response= await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_key}`);
     const data= await response.json();
      // console.log(data);
   return data.list.map(forecast=>{
       const{ main:{temp,temp_max,temp_min}, dt,dt_txt, weather:[{description,icon}]}= forecast;
       return {temp,temp_max,temp_min,dt,dt_txt, description, icon};
    })
   
}
const loadHourlyForecast= ({main:{temp:tempNow},weather:[{icon:iconNow}]},hourlyWeather)=>{
  //console.log(hourlyWeather);

  //use formatter for formatting 24 hour date and time
  //int1 represents international format...set hour12 flag as true
//   ******* ye puchna h int1 me error aa rhi thi

//   const timeFormatter =Int1.DateTimeFormat("en",{
//      hour12:true, hour:"numeric"
//   })
   let dataFor21Hours= hourlyWeather.slice(2,14);
   const hourlyContainer= document.querySelector(".hourly-container");
   let innerHTMLString= `<article>
      <h3 class="time">Now</h3>
      <img class="icon" src="${createIconUrl(iconNow)}">
      <p class="hourly-temp">${formatTemp(tempNow)}</p>
  </article>`;

  // if we want time in 24hr format
 // <h3 class="time">${dt_txt.split(" ")[1]}</h3>
  //try to console  new Date(dt_txt)=> it will give day,date,time
  //so we can take day from it
//   <h3 class="time">${timeFormatter.format(new Date(dt_txt))}</h3>
   for(let{temp,icon,dt_txt} of dataFor21Hours)
   {
      innerHTMLString+= `<article>
    <h3 class="time">${dt_txt.split(" ")[1]}</h3>
      <img class="icon" src="${createIconUrl(icon)}">
      <p class="hourly-temp">${formatTemp(temp)}</p>
  </article>`
   }
   hourlyContainer.innerHTML=  innerHTMLString;
}

const calculateDayWiseForecast= (hourlyWeather)=>{
   console.log(hourlyWeather);
   let dayWiseForecast= new Map();
   for(let forecast of hourlyWeather)
   {
      console.log(forecast);
      const [date]= forecast.dt_txt.split(" ");
      const dayOfWeek= Days_Of_Week[new Date(date).getDay()];
       //console.log(dayOfWeek);
      if(dayWiseForecast.has(dayOfWeek))
      {
        let initForecast= dayWiseForecast.get(dayOfWeek);
       // console.log(initForecast);
          initForecast.push(forecast);
        dayWiseForecast.set(dayOfWeek,initForecast);
      }
      else{
         dayWiseForecast.set(dayOfWeek,forecast);
      }
   }
  // ctrl+f- for search
  // console.log(dayWiseForecast);
   for(let [key,value] of dayWiseForecast)
   {
      let temp_min= Math.min(...Array.from(value,val=>val.temp_min));
      let temp_max= Math.max(...Array.from(value,val=>val.temp_max));
      //console.log(...Array.from(value));
       let icon= Array.from(value,val=>val.icon);
      dayWiseForecast.set(key,{temp_min,temp_max,icon});
   }
   return dayWiseForecast;
   // console.log(dayWiseForecast);
}
const loadDayWiseForecast= (hourlyWeather)=>{
   const dayWiseForecast= calculateDayWiseForecast(hourlyWeather);
   const container= document.querySelector(".five-day-forecast-container");
   let dayWiseInfo="";
   Array.from(dayWiseForecast).map(([day,{temp_max,temp_min,icon}],index)=>{
      if(index<5){
         dayWiseInfo+=`<article class="day-wise-forecast">
      <h3 class="day">${index==0?"Today":day}</h3>
      <img  class="icon"  src="${createIconUrl(icon)}" alt="icon for forecast"/>
      <p class="min_temp">${formatTemp(temp_min)}</p>
      <p class="max_temp">${formatTemp(temp_max)}</p>
  </article>`;
      }
   })
   container.innerHTML= dayWiseInfo;
}

const loadFeelsLike=({main:{feels_like}})=>{
   const fy= document.querySelector("#feels-like");
   fy.querySelector(".feels-like-temp").textContent=`${formatTemp(feels_like)}`;
}

const loadHumidity=({main:{humidity}})=>{
   const fy= document.querySelector("#humidity");
   fy.querySelector(".humidity-val").textContent=`${humidity}%`;
}

const loadForecastUsingGeoLocation= ()=>
{
   navigator.geolocation.getCurrentPosition(({coords})=>{
      // console.log({coord});
      const {latitude:lat, longitude:lon}= coords;
      selectedCity={lat,lon};
      loadData();
   },error=>console.log(error));
}
const loadData= async()=>
{
   const currentWeather= await getCurrentWeatherData(selectedCity)
   // console.log(currentWeather);
    loadCurrentForecast(currentWeather);
    const hourlyWeather= await getHourlyWeatherData(currentWeather);
    //console.log(hourlyWeather);
   loadHourlyForecast(currentWeather,hourlyWeather);
   loadDayWiseForecast(hourlyWeather);
   loadFeelsLike(currentWeather);
   loadHumidity(currentWeather);
}
function debounce(func)
{
   let timer;
   ///this  ... means all values
   return (...args)=>{
      clearTimeout(timer);
      timer= setTimeout(()=>{
         // console.log("debounce");
        func.apply(this,args)
      },500);
   }
}
const onSearchChange= async(event)=>{
   let value= event.target.value;
   if(!value)
   {
    selectedCity=null;
    selectedCityText="";
   }
   if(value &&  (selectedCityText!==value))
   {
      let options="";
      const listOfCities= await getCitiesUsingGeoLocation(value);
  for(let{lat,lon,name,state,country} of listOfCities)
  {
   options+=`<option data-city-details='${JSON.stringify({lat,lon,name})}' value="${name},${state},${country}"></option>`;
  }
  document.querySelector("#cities").innerHTML= options;
  console.log(listOfCities);
   }
}

const handelCitySelection= (event)=>
{
   selectedCityText= event.target.value;
   console.log(selectedCityText);
   let options= document.querySelectorAll("#cities > option");
   console.log(options);
   //now this options is a nodelist so we have to convert it into array for implementing find function
   //as when we see in prtootyoe of nodelist it doesn't have a find function
   if(options?.length)
   {
      // ***** this part is not working find not working****
      let selectedOptions= Array.from(options).find(opt=>opt.value===selectedCityText);
      console.log({selectedOptions});
      selectedCity= JSON.parse(selectedOptions.getAttributes("data-city-details"));
      // json.parse is used for converting object into array
      console.log({selectedCity});
      loadData();
   }
}
const debounceSearch= debounce((event)=> onSearchChange(event))

document.addEventListener("DOMContentLoaded", async()=>{
    loadForecastUsingGeoLocation();
   const searchInput= document.querySelector("#search");
  //so instead of serachchnage ,we will call debouncesearch which will call after 500ms
  //so that is good phle hm jse hi koi word likh rhe the ye search kr rha tha 
  //but ab asa nhi hoga
   searchInput.addEventListener("input",debounceSearch);
   searchInput.addEventListener("change", handelCitySelection);
})