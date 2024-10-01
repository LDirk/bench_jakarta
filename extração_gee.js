// Definindo a área de interesse (Jakarta)
var jakarta = ee.Geometry.Rectangle(106.8456, -6.2146, 106.9356, -6.1546);


var dataset = ee.ImageCollection('NOAA/CFSR')
    .filter(ee.Filter.date('2020-01-01', '2021-05-13'))
    .filterBounds(jakarta)
    .filter(ee.Filter.stringEndsWith('system:index', '03')); // Filtro para system:index que termina com '03'
    
  
    
// Selecionando as bandas de interesse
var temperatureSurface = dataset.select('Temperature_surface');
var relativeHumidity = dataset.select('Relative_humidity_entire_atmosphere_single_layer');
var MSL_Pressure = dataset.select('Pressure_reduced_to_MSL_msl');
var CloudCover = dataset.select('Cloud_water_entire_atmosphere_single_layer');
var Precipitation = dataset.select('Total_precipitation_surface_3_Hour_Accumulation');


// Criando uma função para extrair valores de pixels em uma localização específica
var extractValues = function(image) {
  var date = image.date().format('YYYY-MM-dd');

  // Extraindo cada variável
  var temperature = image.select('Temperature_surface').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: jakarta,
    scale: 5000
  }).get('Temperature_surface');

  var humidity = image.select('Relative_humidity_entire_atmosphere_single_layer').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: jakarta,
    scale: 5000
  }).get('Relative_humidity_entire_atmosphere_single_layer');

  var pressure = image.select('Pressure_reduced_to_MSL_msl').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: jakarta,
    scale: 5000
  }).get('Pressure_reduced_to_MSL_msl');

  var cloudCover = image.select('Cloud_water_entire_atmosphere_single_layer').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: jakarta,
    scale: 5000
  }).get('Cloud_water_entire_atmosphere_single_layer');

  var precipitation = image.select('Total_precipitation_surface_3_Hour_Accumulation').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: jakarta,
    scale: 5000
  }).get('Total_precipitation_surface_3_Hour_Accumulation');


  // Retornando os valores como um Feature
  return ee.Feature(null, {
    'date': date,
    'temperature': temperature,
    'humidity': humidity,
    'pressure': pressure,
    'cloudCover': cloudCover,
    'precipitation': precipitation
  });
};

// Aplicando a função a cada imagem no conjunto de dados
var features = dataset.map(extractValues);

// Convertendo as features em uma coleção de features
var featureCollection = ee.FeatureCollection(features);

// Exportando para CSV
Export.table.toDrive({
  collection: featureCollection,
  description: 'Dados_Jakarta_2020_13_maio_21_final',
  fileFormat: 'CSV'
});
