import {useCallback, useEffect, useState} from 'react';

import {toastError} from '@/helpers/toast.helper';
import {getCity, getDistrict, getProvince, getVillage} from '@/libs/indonesia-data.lib';

const useIndonesiaData = () => {
    const [provinceData, setProvinceData] = useState<{
        data: {id: string; name: string}[];
        loading: boolean;
    }>({
        data: [],
        loading: true,
    });
    const [cityData, setCityData] = useState<{
        data: {id: string; name: string}[];
        loading: boolean;
    }>({
        data: [],
        loading: true,
    });
    const [districtData, setDistrictData] = useState<{
        data: {id: string; name: string}[];
        loading: boolean;
    }>({
        data: [],
        loading: true,
    });
    const [villageData, setVillageData] = useState<{
        data: {id: string; name: string}[];
        loading: boolean;
    }>({
        data: [],
        loading: true,
    });

    const fetchProvinceData = useCallback(async () => {
        try {
            setProvinceData({data: [], loading: true});
            const data = await getProvince();

            setProvinceData({data, loading: false});
            setCityData({data: [], loading: false});
            setDistrictData({data: [], loading: false});
            setVillageData({data: [], loading: false});
        } catch (error) {
            if (error instanceof Error) toastError(`Failed to fetch province data`)(error.message);
        } finally {
            setProvinceData((prev) => ({...prev, loading: false}));
        }
    }, []);

    const fetchCityData = useCallback(async (provinceId: string) => {
        try {
            setCityData({data: [], loading: true});
            const data = await getCity(provinceId);

            setCityData({data, loading: false});
            setDistrictData({data: [], loading: false});
            setVillageData({data: [], loading: false});
        } catch (error) {
            if (error instanceof Error) toastError(`Failed to fetch city data`)(error.message);
        } finally {
            setCityData((prev) => ({...prev, loading: false}));
        }
    }, []);

    const fetchDistrictData = useCallback(async (cityId: string) => {
        try {
            setDistrictData({data: [], loading: true});
            const data = await getDistrict(cityId);

            setDistrictData({data, loading: false});
            setVillageData({data: [], loading: false});
        } catch (error) {
            if (error instanceof Error) toastError(`Failed to fetch district data`)(error.message);
        } finally {
            setDistrictData((prev) => ({...prev, loading: false}));
        }
    }, []);

    const fetchVillageData = useCallback(async (districtId: string) => {
        try {
            setVillageData({data: [], loading: true});
            const data = await getVillage(districtId);

            setVillageData({data, loading: false});
        } catch (error) {
            if (error instanceof Error) toastError(`Failed to fetch village data`)(error.message);
        } finally {
            setVillageData((prev) => ({...prev, loading: false}));
        }
    }, []);

    useEffect(() => {
        fetchProvinceData();
    }, [fetchProvinceData]);

    return {
        provinceData,
        cityData,
        districtData,
        villageData,
        fetchCityData,
        fetchDistrictData,
        fetchVillageData,
    };
};

export default useIndonesiaData;
