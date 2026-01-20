import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <p>Settings form will be here.</p>
    </div>
  )
}
