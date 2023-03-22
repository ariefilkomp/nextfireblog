export default function UserProfile({ user }) {
    return (
        <div className="max-w-md mx-auto align-middle items-center text-center mb-8">
            <img src={user?.photoURL} className="rounded-full mx-auto"/>
            <p className="mt-4 mb-2">
                <i>@{user.username}</i>    
            </p>
            <h1 className="font-semibold text-slate-800 text-2xl">{user.displayName}</h1>
        </div>
    )
}