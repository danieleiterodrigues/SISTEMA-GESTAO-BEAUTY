import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div className="text-slate-500">
        {/* Breadcrumbs or Page Title could go here */}
        <span className="font-medium">Bem-vindo</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{user?.nome || 'Usuário'}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.perfil || 'Perfil'}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
          {user?.nome?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;
