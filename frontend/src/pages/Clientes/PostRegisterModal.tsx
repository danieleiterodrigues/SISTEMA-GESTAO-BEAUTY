import React from 'react';
import { Package, Calendar } from 'lucide-react';

interface PostRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteNome: string;
  onAddService: () => void;
  onAddPackage: () => void;
}

const PostRegisterModal: React.FC<PostRegisterModalProps> = ({
  isOpen,
  onClose,
  clienteNome,
  onAddService,
  onAddPackage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        <div className="bg-purple-600 p-6 text-center text-white">
          <h2 className="text-xl font-bold">Cadastro Realizado!</h2>
          <p className="text-purple-100 text-sm mt-1">
            O que deseja fazer com {clienteNome.split(' ')[0]}?
          </p>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={onAddService}
            className="w-full bg-white border-2 border-purple-100 hover:border-purple-500 hover:bg-purple-50 text-purple-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-between group"
          >
            <span className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              Agendar Serviço
            </span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            onClick={onAddPackage}
            className="w-full bg-white border-2 border-pink-100 hover:border-pink-500 hover:bg-pink-50 text-pink-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-between group"
          >
            <span className="flex items-center gap-3">
              <div className="bg-pink-100 p-2 rounded-lg group-hover:bg-pink-200 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              Vender Pacote
            </span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            onClick={onClose}
            className="w-full mt-4 text-gray-400 hover:text-gray-600 text-sm font-medium py-2"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostRegisterModal;
