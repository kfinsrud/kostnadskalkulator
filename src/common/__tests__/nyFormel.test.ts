import {t_harv_ccf_fj94, TreatmentType} from "../src/nyFormel";


test('Lukket hogst1', ()=>{
    const middleStem = 0.8;
    const stemsPerHectare = 500;
    const stripRoadWidth = 4;
    const harvestStrengthPercent = 45;
    const stripRoadExists = false;
    const patchSizeInHectare = 0.25;
    const slope = 1;
    const surface = 1;


    const result = t_harv_ccf_fj94(
        stemsPerHectare,
        middleStem,
        TreatmentType.PATCH_HARVEST,
        harvestStrengthPercent,
        patchSizeInHectare,
        stripRoadWidth,
        stripRoadExists,
        slope,
        surface
    )
    expect(result.toFixed(3)).toEqual("21.286")
})
test('Lukket hogst2', ()=>{
    const middleStem = 1.5;
    const stemsPerHectare = 700;
    const stripRoadWidth = 4;
    const harvestStrengthPercent = 45;
    const stripRoadExists = false;
    const patchSizeInHectare = 0.25;
    const slope = 2;
    const surface = 1;


    const result = t_harv_ccf_fj94(
        stemsPerHectare,
        middleStem,
        TreatmentType.PATCH_HARVEST,
        harvestStrengthPercent,
        patchSizeInHectare,
        stripRoadWidth,
        stripRoadExists,
        slope,
        surface
    )
    expect(result.toFixed(3)).toEqual("24.257")
})
test('Lukket hogst3', ()=>{
    const middleStem = 0.8;
    const stemsPerHectare = 500;
    const stripRoadWidth = 4;
    const harvestStrengthPercent = 45;
    const stripRoadExists = false;
    const patchSizeInHectare = 0.25;
    const slope = 1;
    const surface = 1;


    const result = t_harv_ccf_fj94(
        stemsPerHectare,
        middleStem,
        TreatmentType.SINGLE_TREE_SELECTION,
        harvestStrengthPercent,
        patchSizeInHectare,
        stripRoadWidth,
        stripRoadExists,
        slope,
        surface
    )
    console.log(result);
    expect(result.toFixed(3)).toEqual("19.106")
})
test('Lukket hogst4', ()=>{
    const middleStem = 0.7;
    const stemsPerHectare = 500;
    const stripRoadWidth = 4;
    const harvestStrengthPercent = 45;
    const stripRoadExists = false;
    const patchSizeInHectare = 0.25;
    const slope = 2;
    const surface = 2;


    const result = t_harv_ccf_fj94(
        stemsPerHectare,
        middleStem,
        TreatmentType.SINGLE_TREE_SELECTION,
        harvestStrengthPercent,
        patchSizeInHectare,
        stripRoadWidth,
        stripRoadExists,
        slope,
        surface
    )
    console.log(result);
    expect(result.toFixed(3)).toEqual("18.273")
})
