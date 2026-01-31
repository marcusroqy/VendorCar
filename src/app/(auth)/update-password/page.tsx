import { UpdatePasswordForm } from './update-password-form';
import Link from 'next/link';
import { Car } from 'lucide-react';

export default function UpdatePasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl">VendorCarro</span>
                    </Link>
                </div>

                <UpdatePasswordForm />
            </div>
        </div>
    );
}
