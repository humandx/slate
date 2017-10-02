import {combineReducers} from "redux"
import casesReducer from "./cases/reducer"

const allReducers = combineReducers({
    cases: casesReducer,
})

export default allReducers
