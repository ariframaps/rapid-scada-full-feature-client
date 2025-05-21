export const AuthReducer = (state, action) => {
    const { type, payload } = action;

    switch (type) {
        case 'LOGGED_IN':
        case 'LOGGED_OUT':
            return { ...state, isLoggedIn: payload.isLoggedIn };
        default:
            throw new Error('gaada pilihan di auth reducernya')
    }
}
