// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { fetchData } from '../util/http';
// import { getLicencia } from '../util/Api';

// // Crear un contexto
// const DataContext = createContext();

// //Proveedor de contexto
// export function DataProvider({ children }) { 
//   const [fetchedData, setFetchedData] = useState([]);

//   useEffect(() => { 
//     async function getData() {
//       const dataClient = await getLicencia();
//       setFetchedData(dataClient);
//     }
//     getData();
//   } );

//   return (
//     <DataContext.Provider value={{ fetchedData, setFetchedData }}>
//       {children}
//     </DataContext.Provider>
//   );
// }

// // Custom hook para usar el contexto
// export function useData() {
//     return useContext(DataContext);
//   }