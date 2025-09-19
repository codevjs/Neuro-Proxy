export const getProvince = async (): Promise<{id: string; name: string}[]> => {
    const response = await fetch('https://ibnux.github.io/data-indonesia/provinsi.json');

    if (!response.ok) throw new Error('Failed to fetch province data from the server');

    const data = await response.json();

    return data.map((province: {id: string; nama: string}) => ({
        id: province.id,
        name: province.nama.toLowerCase(),
    }));
};

export const getCity = async (provinceId: string): Promise<{id: string; name: string}[]> => {
    const response = await fetch(`https://ibnux.github.io/data-indonesia/kabupaten/${provinceId}.json`);

    if (!response.ok) throw new Error('Failed to fetch city data from the server');

    const data = await response.json();

    return data.map((city: {id: string; nama: string}) => ({
        id: city.id,
        name: city.nama.toLowerCase(),
    }));
};

export const getDistrict = async (cityId: string): Promise<{id: string; name: string}[]> => {
    const response = await fetch(`https://ibnux.github.io/data-indonesia/kecamatan/${cityId}.json`);

    if (!response.ok) throw new Error('Failed to fetch district data from the server');

    const data = await response.json();

    return data.map((district: {id: string; nama: string}) => ({
        id: district.id,
        name: district.nama.toLowerCase(),
    }));
};

export const getVillage = async (districtId: string): Promise<{id: string; name: string}[]> => {
    const response = await fetch(`https://ibnux.github.io/data-indonesia/kelurahan/${districtId}.json`);

    if (!response.ok) throw new Error('Failed to fetch village data from the server');

    const data = await response.json();

    return data.map((village: {id: string; nama: string}) => ({
        id: village.id,
        name: village.nama.toLowerCase(),
    }));
};
